import { User } from "../entities";
import { CANT_FIND, PERM_ERR } from "../constants";
import { BaseEntity } from "../entities/BaseEntity";
import { DeepPartial, FindConditions, ObjectType } from "typeorm";
import { PermissionState } from "../types/permission";
import DataLoader from "dataloader";
import has from "lodash/has";
import { DataLoaders } from "../types/dataloaders";
import { FindManyOptions } from "typeorm/find-options/FindManyOptions";
import { asyncFilter } from "../../utils/array";

type PartialWithId<T extends BaseEntity> = Partial<T> & { id: string };

/**
 * @template T entity type of model
 */
export abstract class BaseModel<T extends BaseEntity> {
    protected loader: DataLoader<string, T>;
    protected entityCls: ObjectType<T>;

    protected constructor(protected loaders: DataLoaders) {}

    public async permRead(obj: T, user: User): Promise<PermissionState> {
        if (user.isAdmin) {
            return { hasPerm: true };
        }
        return await this.canRead(obj, user);
    }

    public async permUpdate(
        toUpdate: T,
        updatedFields: Partial<T>,
        user: User
    ): Promise<PermissionState> {
        if (user.isAdmin) {
            return { hasPerm: true };
        }
        return await this.canUpdate(toUpdate, updatedFields, user);
    }

    public async permDelete(toDelete: T, user: User): Promise<PermissionState> {
        if (user.isAdmin) {
            return { hasPerm: true };
        }
        return await this.canDelete(toDelete, user);
    }

    public async permCreate(toCreate: T, user: User): Promise<PermissionState> {
        if (user.isAdmin) {
            return { hasPerm: true };
        }
        return await this.canCreate(toCreate, user);
    }

    get(options: FindManyOptions<T>, user: User): Promise<T>;
    get(options: DeepPartial<T>, user: User): Promise<T>;

    public async get(
        entityLike: DeepPartial<T> | FindManyOptions<T>,
        user: User
    ): Promise<T> {
        const result: T | undefined = await (this.entityCls as any).findOne(
            entityLike
        );
        if (!result) {
            throw new Error(CANT_FIND + this.entityCls.name);
        }
        const { hasPerm, errMsg } = await this.permRead(result, user);
        if (hasPerm) {
            return result;
        }
        throw new Error(errMsg || PERM_ERR);
    }

    public async getIfExists(
        entityLike: DeepPartial<T>,
        user: User
    ): Promise<T | null> {
        const result: T | undefined = await (this.entityCls as any).findOne(
            entityLike
        );
        if (!result) {
            return null;
        }
        const { hasPerm, errMsg } = await this.permRead(result, user);
        if (hasPerm) {
            return result;
        }
        throw new Error(errMsg || PERM_ERR);
    }

    getMany(options: FindManyOptions<T>, user: User): Promise<T[]>;
    getMany(options: DeepPartial<T>, user: User): Promise<T[]>;

    public async getMany(
        entityLike: DeepPartial<T> | FindManyOptions<T>,
        user: User
    ): Promise<T[]> {
        const results = await (this.entityCls as any).find(entityLike);
        return await asyncFilter(results, async (result) => {
            const { hasPerm } = await this.permRead(result, user);
            return hasPerm;
        });
    }

    public async getById(entityId: string, user: User): Promise<T> {
        let result: T;
        try {
            result = await this.loader.load(entityId);
        } catch (e) {
            throw new Error(CANT_FIND + this.entityCls.name);
        }
        const { hasPerm, errMsg } = await this.permRead(result, user);
        if (hasPerm) {
            return result;
        }
        throw new Error(errMsg || PERM_ERR);
    }

    public async getByIds(entityIds: string[], user: User): Promise<T[]> {
        const results = await this.loader.loadMany(entityIds);
        return (await asyncFilter(results, async (result) => {
            if (result instanceof Error) {
                return false;
            } else {
                return (await this.permRead(result, user)).hasPerm;
            }
        })) as T[];
    }

    public async create(entityLike: Partial<T>, user: User): Promise<T> {
        const toCreate: T = (this.entityCls as any).create(entityLike);
        const { hasPerm, errMsg } = await this.permCreate(toCreate, user);
        if (hasPerm) {
            return await toCreate.save();
        }
        throw new Error(errMsg || PERM_ERR);
    }

    public async createMany(
        entityLike: Partial<T>[],
        user: User
    ): Promise<T[]> {
        const toCreate: T[] = (this.entityCls as any).create(entityLike);
        for (const obj of toCreate) {
            const { hasPerm, errMsg } = await this.permCreate(obj, user);
            if (!hasPerm) {
                throw new Error(errMsg || PERM_ERR);
            }
        }
        return await (this.entityCls as any).save(toCreate);
    }

    public async updateMany(
        toUpdateFind: FindConditions<T> | T,
        updatedFields: Partial<T>,
        user: User
    ): Promise<T[]> {
        const updated: T[] = [];
        const toUpdate: T[] = await (this.entityCls as any).find(toUpdateFind);
        for (let updateCandidate of toUpdate) {
            const { hasPerm, errMsg } = await this.permUpdate(
                updateCandidate,
                updatedFields,
                user
            );
            if (!hasPerm) {
                throw new Error(errMsg || PERM_ERR);
            }
            updateCandidate = {
                ...updateCandidate,
                ...updatedFields,
            };
            updated.push(await (this.entityCls as any).save(toUpdate));
        }
        return updated;
    }

    public async update(
        toUpdateFind: FindConditions<T> | T,
        updatedFields: Partial<T>,
        user: User
    ): Promise<T> {
        let toUpdate: T;
        if (toUpdateFind instanceof this.entityCls) {
            toUpdate = toUpdateFind as T;
        } else {
            const updateCandidates: T[] = await (this.entityCls as any).find(
                toUpdateFind
            );
            if (updateCandidates.length === 0) {
                throw new Error(CANT_FIND);
            }
            if (updateCandidates.length > 1) {
                throw new Error(
                    `Multiple ${this.entityCls.name} objects found due to ambiguous fields`
                );
            }
            toUpdate = updateCandidates[0];
        }
        const { hasPerm, errMsg } = await this.permUpdate(
            toUpdate,
            updatedFields,
            user
        );
        if (hasPerm) {
            toUpdate = {
                ...toUpdate,
                ...updatedFields,
            };
            return await (this.entityCls as any).save(toUpdate);
        }
        throw new Error(errMsg || PERM_ERR);
    }

    save(toSave: Partial<T>[], user: User): Promise<T[]>;
    save(toSave: Partial<T>, user: User): Promise<T>;

    public async save(
        toSave: Partial<T> | Partial<T>[],
        user: User
    ): Promise<T[] | T> {
        let entityArr: Partial<T>[];
        let ret: T[] = [];
        if (toSave instanceof Array) {
            entityArr = toSave;
        } else {
            entityArr = [toSave];
        }
        const toCreate: Partial<T>[] = entityArr.filter(
            (entity) => !has(entity, "id")
        );
        const updatedFields = entityArr.filter((entity) =>
            has(entity, "id")
        ) as PartialWithId<T>[];
        ret.push(...(await this.createMany(toCreate, user)));
        for (const toUpdateEntity of updatedFields) {
            const entity = await this.getById(toUpdateEntity.id, user);
            const { hasPerm, errMsg } = await this.permUpdate(
                entity,
                toUpdateEntity,
                user
            );
            if (!hasPerm) {
                throw new Error(errMsg || PERM_ERR);
            }
        }
        ret.push(...(await (this.entityCls as any).save(updatedFields)));
        return ret;
    }

    public async delete(
        deleteCriteria: FindConditions<T> | FindManyOptions<T>,
        user: User
    ): Promise<T> {
        const deleteCandidates: T[] = await (this.entityCls as any).find(
            deleteCriteria
        );
        if (deleteCandidates.length === 0) {
            throw new Error(CANT_FIND + this.entityCls.name);
        }
        if (deleteCandidates.length > 1) {
            throw new Error(
                `Multiple ${this.entityCls.name} objects found due to ambiguous fields`
            );
        }
        const toDelete = deleteCandidates[0];
        if (!toDelete) {
            throw new Error(CANT_FIND + this.entityCls.name);
        }
        const { hasPerm, errMsg } = await this.permDelete(toDelete, user);
        if (hasPerm) {
            return await toDelete.remove();
        }
        throw new Error(errMsg || PERM_ERR);
    }

    public async deleteMany(
        deleteCriteria: FindConditions<T> | FindManyOptions<T>,
        user: User
    ): Promise<T[]> {
        const deleteCandidates: T[] = await (this.entityCls as any).find(
            deleteCriteria
        );
        for (const toDelete of deleteCandidates) {
            const { hasPerm, errMsg } = await this.permDelete(toDelete, user);
            if (!hasPerm) {
                throw new Error(errMsg || PERM_ERR);
            }
        }
        return await (this.entityCls as any).remove(deleteCandidates);
    }

    /**
     * Determines if a user an read an object
     *
     * @param {T} _ Object to be read
     * @param {User} user user performing this action: User performing the reading
     * @returns {PermissionState} indicates if user can perform this action
     * @protected
     */
    protected async canRead(_: T, user: User): Promise<PermissionState> {
        return { hasPerm: user.isAdmin };
    }

    /**
     * Determines if a user can update an object
     *
     * @param {T} _ object to be updated
     * @param {Partial<T>} __ updated fields
     * @param {User} user user performing this action
     * @returns {PermissionState} indicates if user can perform this action
     * @protected
     */
    protected async canUpdate(
        _: T,
        __: Partial<T>,
        user: User
    ): Promise<PermissionState> {
        return { hasPerm: user.isAdmin };
    }

    /**
     * Determines if a user can delete an object
     *
     * @param {T} _ object to be deleted
     * @param {User} user user performing this action
     * @returns {PermissionState} indicates if user can perform this action
     * @protected
     */
    protected async canDelete(_: T, user: User): Promise<PermissionState> {
        return { hasPerm: user.isAdmin };
    }

    /**
     * Determines if a user can create an object
     *
     * @param {T} _ object to be created
     * @param {User} user user performing this action
     * @returns {PermissionState} indicates if user can perform this action
     * @protected
     */
    protected async canCreate(_: T, user: User): Promise<PermissionState> {
        return { hasPerm: user.isAdmin };
    }
}
