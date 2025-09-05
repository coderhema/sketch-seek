import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="text-center">
      <div className="inline-block p-2 sm:p-4 ">
        <h1 className="text-4xl sm:text-5xl font-bold text-black flex items-center justify-center gap-3">
          <img 
            src="https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExbHdkb2NqNTF0N2JkamoxdGFjc2VpZXJoYzc0OW1uZzdkNzc3YzJmdSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/FOuIZIAdCFUSrPkcyp/giphy.gif" 
            alt="Animated eyes looking left and right" 
            className="w-15 h-12 sm:w-18 sm:h-16" 
          />
          Sketch & Seek
        </h1>
      </div>
    </header>
  );
};

export default Header;