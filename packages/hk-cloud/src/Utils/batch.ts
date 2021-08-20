import { from } from "rxjs";

export const toBatchUow = (batch) => ({ batch })

// use with flatMap
export const unBatchUow = (uow) => {
    const { batch, ...outerUowMinusBatch } = uow;
    return batch.map((innerUowFromBatch) => ({
        ...innerUowFromBatch,
        ...outerUowMinusBatch,
    }));
}

// use with flatMap after highland group step
export const toGroupUows = (groups) => from(Object.keys(groups).map((key) => ({ batch: groups[key] })));
