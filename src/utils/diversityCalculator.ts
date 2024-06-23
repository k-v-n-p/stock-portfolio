type SectorData ={
    [sector: string]: number[];
}

export const EvalDiveristyScore = (data: SectorData) => {
    // sum of values for each sector
    console.log("calculating for data", data)
    const sectorSums: { [sector: string]: number } = {};
    for (const sector in data) {
        if (data.hasOwnProperty(sector)) {
            sectorSums[sector] = data[sector].reduce((sum, value) => sum + value, 0);
        }
    }
    // total sum of all sectors
    const totalSum: number = Object.values(sectorSums).reduce((sum, value) => sum + value, 0);
    // percentage of each sector relative to the total sum
    const sectorPercentages: { [sector: string]: number } = {};
    for (const sector in sectorSums) {
        if (sector in sectorSums) {
            sectorPercentages[sector] = (sectorSums[sector] / totalSum) * 100;
        }
    }
    // Final score by given formula
    const sectorPercentagesValues: number[] = Object.values(sectorPercentages);
    const score: number = sectorPercentagesValues.length > 0
        ? 100-(sectorPercentagesValues.reduce((sum, percentage) => sum + percentage ** 2, 0) / sectorPercentagesValues.length)/100
        : 0;
    return score;
}