import { TITILER_BASE_URL } from '@/constants/consts';
import React from 'react';

type ColorMap = string; // or stricter enum if needed

interface ColorMapLegendProps {
  colormap: ColorMap;
  width?: number | string;
  height?: number | string;
}

const GET_COLORMAP_LEGEND = (colormap: ColorMap) => {
  return `${TITILER_BASE_URL}/colorMaps/${colormap}?format=png&orientation=horizontal`;
};

const ColorMapLegend: React.FC<ColorMapLegendProps> = ({ colormap, width = '100%', height = 'auto' }) => {
  const legendUrl = GET_COLORMAP_LEGEND(colormap);

  return (

      <img
        src={legendUrl}
        alt={`Colormap legend for ${colormap}`}
        style={{ width, height, display: 'block' }}
      />

  );
};

export default ColorMapLegend;
