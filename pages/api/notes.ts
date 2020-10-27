import { nSQL } from '@nano-sql/core';

const connectMiddleware = (handler: any) => async (req: any, res: any) => {
    const dbName = 'with-redux-toolkit';

    if (!nSQL().listDatabases().includes(dbName)) {
        await nSQL().createDatabase({
            id: dbName,
            mode: 'PERM',
            tables: [
                {
                    name: 'notes',
                    model: {
                        'id:uuid': { pk: true },
                        'title:string': { notNull: true },
                        'content:string': { notNull: true },
                        'createdAt:date': { default: () => new Date() },
                    },
                },
            ],
            version: 1,
        });
    }
    nSQL().useDatabase(dbName);

    return handler(req, res);
};
const saveNote = async (req: any, res: any) => {
    const { title, content } = req.body;
    const errors = {};

    if (!title) {
        // @ts-ignore
        errors['title'] = 'Title is required';
    }

    if (!content) {
        // @ts-ignore
        errors['content'] = 'Content is required';
    }

    if (Object.keys(errors).length > 0)
        return res.status(422).json({
            statusCode: 422,
            message: 'Unprocessable Entity',
            errors,
        });

    const [note] = await nSQL('notes')
        .query('upsert', { title, content })
        .exec();

    res.status(201).json(note);
};
const listNotes = async (_: any, res: any) => {
    const notes = await nSQL('notes').query('select').exec();

    res.json(notes);
};
const updateNote = async (req: any, res: any) => {
    const { noteId } = req.query;
    const [note] = await nSQL()
        .query('select')
        .where(['id', '=', noteId])
        .limit(1)
        .exec();

    if (!note)
        return res.status(404).json({
            statusCode: 404,
            message: 'Not Found',
        });

    const { title = note.title, content = note.content } = req.body;
    const [noteUpdated] = await nSQL('notes')
        .query('upsert', { title, content })
        .where(['id', '=', noteId])
        .limit(1)
        .exec();

    res.json(noteUpdated);
};
const removeNote = async (req: any, res: any) => {
    const { noteId } = req.query;
    const [note] = await nSQL()
        .query('select')
        .where(['id', '=', noteId])
        .limit(1)
        .exec();

    if (!note)
        return res.status(404).json({
            statusCode: 404,
            message: 'Not Found',
        });

    await nSQL('notes')
        .query('delete')
        .where(['id', '=', noteId])
        .limit(1)
        .exec();

    res.status(204).send(null);
};

const handler = (req: any, res: any) => {
    switch (req.method) {
        case 'POST':
            return saveNote(req, res);
        case 'GET':
            return listNotes(req, res);
        case 'PUT':
            return updateNote(req, res);
        case 'DELETE':
            return removeNote(req, res);
        default:
            return res.status(404).json({
                statusCode: 404,
                message: 'Not Found',
            });
    }
};

export default connectMiddleware(handler);
