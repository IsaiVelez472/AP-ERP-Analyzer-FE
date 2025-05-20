import React from 'react';

function TailwindTest() {
  return (
    <div className="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-md flex items-center space-x-4">
      <div className="flex-shrink-0">
        <div className="h-12 w-12 bg-blue-500 rounded-full flex items-center justify-center">
          <span className="text-white text-xl font-bold">T</span>
        </div>
      </div>
      <div>
        <div className="text-xl font-medium text-black">Tailwind CSS 3</div>
        <p className="text-gray-500">Successfully installed and configured!</p>
      </div>
    </div>
  );
}

export default TailwindTest;
