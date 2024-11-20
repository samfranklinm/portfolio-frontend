// src/pages/Home.js
import React from 'react';
import Chat from '../components/chat/Chat';
import { LogoLink } from '../components/logo/LogoLink';
import {FooterText} from '../components/footer/FooterText';

function Home() {
  return (
<div className="relative min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-[#dbd8d5] to-[#8C8278] text-black">
<LogoLink />
      <div className="w-100 max-w-3xl text-center mb-4 mt-20 flex-grow flex flex-col items-center justify-center">
        <h1 className="text-5xl font-light mb-4 tracking-tight">You made it!</h1>
        <p className="text-lg text-gray-600 font-light">
          I'm Frank, I'm sure you're eager to get to know me.. well start typing!
        </p>
      </div>
      <div className="w-100 max-w-4xl flex-none h-55 flex items-center justify-center">
        <Chat />
      </div>
      <FooterText />
    </div>
  );
}

export default Home;