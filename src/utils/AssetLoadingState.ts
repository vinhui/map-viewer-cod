export class AssetLoadingState {
    public static currentlyLoading = new Set<string>()
    public static onChange: () => void

    public static onStartLoading(id: string) {
        this.currentlyLoading.add(id)
        if (this.onChange) this.onChange()
    }

    public static onLoadingComplete(id: string) {
        this.currentlyLoading.delete(id)
        if (this.onChange) this.onChange()
    }
}