export interface TSAlgorithm {
    run(delay: number): Promise<boolean>
}