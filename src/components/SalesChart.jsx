import React, { useEffect, useRef } from 'react';

function SalesChart() {
  const chartRef = useRef(null);
  
  useEffect(() => {
    // Mock chart data
    const mockChartData = {
      months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      thisYear: [4800, 5200, 4900, 6500, 7200, 8100, 7800, 9000, 8800, 9500, 10200, 11100],
      lastYear: [3800, 4100, 3800, 5200, 5800, 6500, 6200, 7300, 7100, 7800, 8400, 9100]
    };

    // This is a mock implementation - in a real app, you would use a chart library like Chart.js
    if (chartRef.current) {
      const canvas = chartRef.current;
      const ctx = canvas.getContext('2d');
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Set canvas dimensions
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = 300;
      
      // Draw mock chart (simplified representation)
      const drawMockChart = () => {
        const width = canvas.width;
        const height = canvas.height;
        const padding = 40;
        const chartWidth = width - (padding * 2);
        const chartHeight = height - (padding * 2);
        const barWidth = chartWidth / mockChartData.months.length / 3;
        
        // Draw axes
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, height - padding);
        ctx.lineTo(width - padding, height - padding);
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Draw bars for this year
        const maxValue = Math.max(...mockChartData.thisYear, ...mockChartData.lastYear);
        
        mockChartData.thisYear.forEach((value, index) => {
          const x = padding + (index * (chartWidth / mockChartData.months.length)) + (chartWidth / mockChartData.months.length / 4);
          const barHeight = (value / maxValue) * chartHeight;
          const y = height - padding - barHeight;
          
          ctx.fillStyle = '#3b82f6';
          ctx.fillRect(x, y, barWidth, barHeight);
        });
        
        // Draw bars for last year
        mockChartData.lastYear.forEach((value, index) => {
          const x = padding + (index * (chartWidth / mockChartData.months.length)) + (chartWidth / mockChartData.months.length / 4) + barWidth + 2;
          const barHeight = (value / maxValue) * chartHeight;
          const y = height - padding - barHeight;
          
          ctx.fillStyle = '#93c5fd';
          ctx.fillRect(x, y, barWidth, barHeight);
        });
        
        // Draw month labels
        ctx.fillStyle = '#64748b';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        
        mockChartData.months.forEach((month, index) => {
          const x = padding + (index * (chartWidth / mockChartData.months.length)) + (chartWidth / mockChartData.months.length / 2);
          const y = height - padding + 15;
          ctx.fillText(month, x, y);
        });
      };
      
      drawMockChart();
      
      // Redraw on window resize
      const handleResize = () => {
        canvas.width = canvas.parentElement.clientWidth;
        drawMockChart();
      };
      
      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, []);

  return (
    <div className="flex flex-col bg-white border shadow-sm rounded-xl">
      <div className="p-4 md:p-5">
        <div className="flex justify-between items-center gap-2">
          <h3 className="text-lg font-bold text-gray-800">
            Sales Overview
          </h3>
          <div className="flex items-center gap-x-2">
            <span className="block w-3 h-3 bg-blue-600 rounded-full"></span>
            <span className="text-sm text-gray-500">This Year</span>
            <span className="block w-3 h-3 bg-blue-300 rounded-full"></span>
            <span className="text-sm text-gray-500">Last Year</span>
          </div>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Monthly revenue comparison
        </p>
      </div>
      <div className="p-4 md:p-5">
        <div className="h-[300px]">
          <canvas ref={chartRef} className="w-full h-full"></canvas>
        </div>
      </div>
    </div>
  );
}

export default SalesChart;
