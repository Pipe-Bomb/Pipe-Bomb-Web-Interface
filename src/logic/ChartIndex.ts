import TrackList from "pipebomb.js/dist/collection/TrackList";
import PipeBombConnection from "./PipeBombConnection";

export default class ChartIndex {
    private static instance: ChartIndex;

    private charts: Map<string, TrackList> | null = null;

    private constructor() {
        this.checkCharts();

        setTimeout(() => {
            this.checkCharts();
        }, 30_000);

        PipeBombConnection.getInstance().registerUpdateCallback(() => {
            if (PipeBombConnection.getInstance().getStatus() == "authenticated") {
                this.charts = null;
                this.checkCharts();
            }
        });
    }

    public static getInstance() {
        if (!this.instance) this.instance = new ChartIndex();
        return this.instance;
    }

    private setChart(chart: TrackList) {
        if (!this.charts) this.charts = new Map();
        const chartID = chart.collectionID.split("/").pop();
        if (!chartID) return chart;
        const existingChart = this.charts.get(chartID);
        if (existingChart) {
            existingChart.copyFromOtherTrackList(chart);
            return existingChart;
        } else {
            this.charts.set(chartID, chart);
            return chart;
        }
    }

    private async checkCharts() {
        if (PipeBombConnection.getInstance().getStatus() != "authenticated") return;
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
        if (!chart || !chart.getTrackList()?.length) {
            const newChart = await PipeBombConnection.getInstance().getApi().v1.getChart(chartID);
            return this.setChart(newChart);
        }
        return chart;
    }
}