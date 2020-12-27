import { Model, ModelCtor, Sequelize, STRING } from 'sequelize';

const MODEL_NAME = 'Store';

interface AppPropertiesAttributes {
    storeUrl: string;
    token: string;
}

interface AppPropertiesInstance
    extends Model<AppPropertiesAttributes>,
        AppPropertiesAttributes {}

class ConfigManager {
    private readonly appProperties: ModelCtor<AppPropertiesInstance>;

    private readonly connectionPromise: Promise<Model<AppPropertiesAttributes>>;

    public constructor(modelName: string) {
        const devEnv = process.env.NODE_ENV !== 'production';

        const sequelize = devEnv
            ? new Sequelize('sqlite::memory:')
            : new Sequelize(
                  String(process.env.PLUGIN_CONFIGURATION_DATABASE_URL),
              );

        this.appProperties = sequelize.define<AppPropertiesInstance>(
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

        this.connectionPromise = this.appProperties.sync();
    }

    public async getToken(storeUrl: string): Promise<string | undefined> {
        await this.connectionPromise;

        const entry: AppPropertiesAttributes | null = (await this.appProperties.findOne(
            {
                where: { storeUrl },
            },
        )) as AppPropertiesAttributes | null;

        return entry?.token;
    }

    public async updateToken(
        storeUrl: string,
        token: string,
    ): Promise<boolean> {
        await this.connectionPromise;

        const updatedAppProperties = await this.appProperties.upsert({
            storeUrl,
            token,
        });

        return !!updatedAppProperties?.[0];
    }

    public async removeToken(storeUrl: string): Promise<void> {
        await this.connectionPromise;

        await this.appProperties.destroy({
            where: {
                storeUrl,
            },
        });
    }
}

const configManager = new ConfigManager(MODEL_NAME);

export default configManager;
