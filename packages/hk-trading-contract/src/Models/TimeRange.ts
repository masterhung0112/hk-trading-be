export interface TimeRange {
    /** Left-bound of the range | Index (in IB mode) */
    from: number
    
    /** Right-bound of the range | Index (in IB mode) */
    to: number

    exp?: boolean;
}

export type TimeRangeCreator = (from: number, to: number, exp?: boolean) => TimeRange