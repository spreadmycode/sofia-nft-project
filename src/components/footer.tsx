import React from 'react';
import Link from 'next/link'

const Footer: React.FC = () => {
  return <div className="flex bg-black justify-center py-10">
    <div className="flex flex-col space-y-6">
      <div className="w-full flex justify-center items-center cursor-pointer">
        <Link href="/">
          <img src={'/images/logo_footer.png'} />
        </Link>
      </div>

      <div className="w-full flex flex-row justify-center items-center">
        <a href="https://nftcalendar.io/event/panda-warriors-nft/" target="_blank" className="inline-flex text-center justify-center items-center">
          <p className="text-section-title">As seen on</p>
          <img src={'/images/nft_calendar.png'} width="20%" />
        </a>
      </div>

      <div className="w-full flex flex-row justify-center items-center">
        <a href="https://nftsolana.io" target="_blank" className="inline-flex text-center justify-center items-center">
          <img src={'/images/nft_logo.png'} />
        </a>
      </div>

      <div className="w-full flex justify-center items-center">
        <a href="https://raritysniper.com/" target="_blank" className="inline-flex text-center justify-center items-center">
          <img src={'/images/rarity_logo/logo3-white.png'} width="50%" />
        </a>
      </div>

      <div className="grid grid-cols-4 gap-6 px-10 py-5">
        <a href="https://mobile.twitter.com/PandaWarriorNFT" target="_blank" className="inline-flex text-center justify-center items-center">
          <img src={'/images/icon_twitter.png'} />
        </a>
        <a href="https://discord.com/invite/EaefjHZJKH" target="_blank" className="inline-flex text-center justify-center items-center">
          <img src={'/images/icon_discord.png'} />
        </a>
        <a href="https://www.instagram.com/pandawarriors_nft/" target="_blank" className="inline-flex text-center justify-center items-center">
          <img src={'/images/icon_instagram.png'} />
        </a>
        <a href="https://vm.tiktok.com/ZSeBEyjcy/" target="_blank" className="inline-flex text-center justify-center items-center">
          <img src={'/images/icon_tiktok.png'} />
        </a>
      </div>

      <p className="text-white text-center">Copyright © 2021, All rights reserved.</p>
    </div>
  </div>;
}

export default Footer;