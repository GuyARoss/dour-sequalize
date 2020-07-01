import Sequelize from 'sequelize';
import lazyTruth from 'dour/utils/lazy-truth'
import { modeler } from 'dour'
import { DataSourceAdapter } from 'dour/types'

export interface SequalizeConfiguration {
    database: string,
    username: string,
    password: string,
    dialect: string,
    host: string,
    port: number,
}

const convertType = (type: number) => lazyTruth({
    [modeler.Date]: Sequelize.DATE,
    [modeler.Number]: Sequelize.INTEGER,
    [modeler.String]: Sequelize.STRING,
}, (current: string) => current === type.toString())

export const translateModel = (model: any) =>
    Object.keys(model).reduce((a: any, c) => ({
        ...a,
        [c]: c !== 'id' ? convertType(model[c]) : {
            primaryKey: true,
            type: convertType(model[c])
        }
    }), {})

export default (config: SequalizeConfiguration): DataSourceAdapter => {
    const sequelizeInstance: any = Sequelize

    const seq = new sequelizeInstance(
        config.database,
        config.username,
        config.password, {
        port: config.port,
        host: config.host,
        dialect: config.dialect,
    })

    seq.sync().catch((err: string) => {
        throw err
    })

    return {
        dataSource: seq,
        translateModel,
    }
}