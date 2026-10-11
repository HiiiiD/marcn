<ChartContainer
  config={config}
  accessibilityLabel="Bar chart of visitors per month"
  definition={({ config, color }) =>
    defineChart({
      marks: [barY(rows, { x: 'month', y: 'value', color: 'series' })],
      color: { ...color },
      tooltip: chartTooltip(config),
    })
  }
>
  <ChartLegend />
</ChartContainer>
