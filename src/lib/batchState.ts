let pending: File[] = []
export const setBatchFiles = (files: File[]) => { pending = [...files] }
export const takeBatchFiles = (): File[] => { const f = pending; pending = []; return f }

let pendingSingle: File | null = null
export const setSingleFile = (f: File) => { pendingSingle = f }
export const takeSingleFile = (): File | null => { const f = pendingSingle; pendingSingle = null; return f }
