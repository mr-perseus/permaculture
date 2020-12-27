import { Model, ModelCtor, Sequelize, STRING } from 'sequelize';

const MODEL_NAME = 'Store';

interface StoreToken {
    storeUrl: string;
    token: string;
}

interface AppPropertiesInstance extends Model<StoreToken>, StoreToken {}

class KeyValueStore {
    private readonly storeTokens: ModelCtor<AppPropertiesInstance>;

    private readonly connectionPromise: Promise<Model<StoreToken>>;

    public constructor(modelName: string) {
        const devEnv = process.env.NODE_ENV !== 'production';

        const sequelize = devEnv
            ? new Sequelize({
                  dialect: 'sqlite',
                  storage: 'store.db',
              })
            : new Sequelize(
                  String(process.env.PLUGIN_CONFIGURATION_DATABASE_URL),
              );

        this.storeTokens = sequelize.define<AppPropertiesInstance>(
            modelName,
            {
                storeUrl: {
                    type: STRING,
                    allowNull: false,
                },
                token: {
                    type: STRING,
                    allowNull: false,
                },
            },
            {
                indexes: [
                    {
                        unique: true,
                        fields: ['storeUrl'],
                    },
                ],
                timestamps: false,
            },
        );

        this.connectionPromise = this.storeTokens.sync();
    }

    public async getToken(storeUrl: string): Promise<string | undefined> {
        await this.connectionPromise;

        const entry: StoreToken | null = (await this.storeTokens.findOne({
            where: { storeUrl },
        })) as StoreToken | null;

        return entry?.token;
    }

    public async updateToken(storeUrl: string, token: string): Promise<void> {
        await this.connectionPromise;

        await this.storeTokens.upsert({
            storeUrl,
            token,
        });
    }
}

const keyValueStore = new KeyValueStore(MODEL_NAME);

export default keyValueStore;
