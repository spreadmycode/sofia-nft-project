import React from 'react';
import Link from 'next/link'

const Footer: React.FC = () => {
  return <div className="flex bg-black justify-center py-10">
    <div className="flex flex-col space-y-3">
      <div className="w-full flex justify-center items-center">
        <img src={'/images/logo_footer.png'} />
      </div>

      <div className="grid grid-cols-4 gap-6 px-10">
        <a href="https://twitter.com" target="_blank" className="inline-flex text-center justify-center items-center">
          <img src={'/images/icon_twitter.png'} />
        </a>
        <a href="https://discord.com" target="_blank" className="inline-flex text-center justify-center items-center">
          <img src={'/images/icon_discord.png'} />
        </a>
        <a href="https://instagram.com" target="_blank" className="inline-flex text-center justify-center items-center">
          <img src={'/images/icon_instagram.png'} />
        </a>
        <a href="https://tiktok.com" target="_blank" className="inline-flex text-center justify-center items-center">
          <img src={'/images/icon_tiktok.png'} />
        </a>
      </div>

      <p className="text-white text-center">Copyright © 2021, All rights reserved.</p>
    </div>
  </div>;
}

export default Footer;