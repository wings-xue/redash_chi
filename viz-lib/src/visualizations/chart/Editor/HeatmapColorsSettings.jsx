import { map } from "lodash";
import React from "react";
import { Section, Select, ColorPicker } from "@/components/visualizations/editor";
import { EditorPropTypes } from "@/visualizations/prop-types";
import ColorPalette from "@/visualizations/ColorPalette";

const ColorSchemes = [
  "Blackbody",
  "Bluered",
  "Blues",
  "Earth",
  "Electric",
  "Greens",
  "Greys",
  "Hot",
  "Jet",
  "Picnic",
  "Portland",
  "Rainbow",
  "RdBu",
  "Reds",
  "Viridis",
  "YlGnBu",
  "YlOrRd",
  "Custom...",
];

export default function HeatmapColorsSettings({ options, onOptionsChange }) {
  return (
    <React.Fragment>
      <Section>
        <Select
          label="配色方案"
          data-test="Chart.Colors.Heatmap.ColorScheme"
          placeholder="请选择配色方案..."
          allowClear
          value={options.colorScheme || undefined}
          onChange={value => onOptionsChange({ colorScheme: value || null })}>
          {map(ColorSchemes, scheme => (
            <Select.Option key={scheme} value={scheme} data-test={`Chart.Colors.Heatmap.ColorScheme.${scheme}`}>
              {scheme}
            </Select.Option>
          ))}
        </Select>
      </Section>

      {options.colorScheme === "Custom..." && (
        <React.Fragment>
          <Section>
            <ColorPicker
              layout="horizontal"
              label="最小值颜色"
              data-test="Chart.Colors.Heatmap.MinColor"
              interactive
              placement="topLeft"
              presetColors={ColorPalette}
              color={options.heatMinColor}
              onChange={heatMinColor => onOptionsChange({ heatMinColor })}
              addonAfter={<ColorPicker.Label color={options.heatMinColor} presetColors={ColorPalette} />}
            />
          </Section>
          <Section>
            <ColorPicker
              layout="horizontal"
              label="最大值颜色"
              data-test="Chart.Colors.Heatmap.MaxColor"
              interactive
              placement="topRight"
              presetColors={ColorPalette}
              color={options.heatMaxColor}
              onChange={heatMaxColor => onOptionsChange({ heatMaxColor })}
              addonAfter={<ColorPicker.Label color={options.heatMaxColor} presetColors={ColorPalette} />}
            />
          </Section>
        </React.Fragment>
      )}
    </React.Fragment>
  );
}

HeatmapColorsSettings.propTypes = EditorPropTypes;
