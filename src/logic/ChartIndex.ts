import TrackList from "pipebomb.js/dist/collection/TrackList";
import PipeBombConnection from "./PipeBombConnection";

export default class ChartIndex {
    private static instance: ChartIndex;

    private charts: Map<string, TrackList> | null = null;

    private constructor() {
        setTimeout(() => {
            this.checkCharts();
        }, 30_000);
    }

    public static getInstance() {
        if (!this.instance) this.instance = new ChartIndex();
        return this.instance;
    }

    private setChart(chart: TrackList) {
        if (!this.charts) this.charts = new Map();
        const existingChart = this.charts.get(chart.collectionID);
        if (existingChart) {
            existingChart.copyFromOtherTrackList(chart);
            return existingChart;
        } else {
            this.charts.set(chart.collectionID, chart);
            return chart;
        }
    }

    private async checkCharts() {
        try {
            const newCharts = await PipeBombConnection.getInstance().getApi().v1.getCharts();
            for (let chart of newCharts) {
                this.setChart(chart);
            }
        } catch (e) {
            console.error(e);
        }
    }

    public async getCharts(): Promise<TrackList[]> {
        if (!this.charts) {
            await this.checkCharts();
        }
        if (!this.charts) return [];
        return Array.from(this.charts.values());
    }

    public async getChart(chartID: string): Promise<TrackList> {
        const chart = this.charts && this.charts.get(chartID);
        if (!chart || !chart.getTrackList().length) {
            const newChart = await PipeBombConnection.getInstance().getApi().v1.getChart(chartID);
            return this.setChart(newChart);
        }
        console.log("using cached tracklist");
        return chart;
    }
}