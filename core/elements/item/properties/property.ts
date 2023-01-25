export interface Property {
    load: (tree: boolean) => Promise<void>,
    fetch: (tree: boolean) => Promise<void>,
    fill: (tree: boolean) => Promise<void>,
    update: () => void,
    tree: {
        landed: boolean
    }
}
