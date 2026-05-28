let pending: File[] = []
export const setBatchFiles = (files: File[]) => { pending = [...files] }
export const takeBatchFiles = (): File[] => { const f = pending; pending = []; return f }
