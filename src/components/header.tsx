import { WalletDisconnectButton, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import React from 'react';
import Link from 'next/link'
import { useWindowSize } from '../hooks/use-window-size';

const Header: React.FC = () => {

  const {width, height} = useWindowSize();

  return <div className="flex flex-row justify-between items-center px-10 theme-bg-color">
    <div>
      <img src={'/images/logo.png'} width={113} height={113} />
    </div>
    {width > 1280 ?
      <div className="flex flex-row justify-between space-x-8 items-center">
        <button className="outline-none bg-transprent theme-header-link text-white uppercase focus:outline-none">
          WHY US
        </button>
        <button className="outline-none bg-transprent theme-header-link text-white uppercase focus:outline-none">
          ROADMAP
        </button>
        <button className="outline-none bg-transprent theme-header-link text-white uppercase focus:outline-none">
          BENEFITS
        </button>
        <button className="outline-none bg-transprent theme-header-link text-white uppercase focus:outline-none">
          ATTRIBUTES
        </button>
        <button className="outline-none bg-transprent theme-header-link text-white uppercase focus:outline-none">
          TEAM
        </button>
        <button className="outline-none bg-transprent theme-header-link text-white uppercase focus:outline-none">
          FAQ
        </button>
        <button className="outline-none bg-transprent theme-header-link text-white uppercase focus:outline-none">
          LAUNCHPAD
        </button>
        <button className="outline-none bg-transprent theme-header-link text-white uppercase focus:outline-none">
          MARKETPLACE
        </button>
      </div>
      :
      <>
      <div className="flex-grow h-1"></div>
      <div className="dropdown inline-block relative mx-2">
        <button className="button-menu inline-flex items-center">
          <span className="mr-1">Menu</span>
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/> </svg>
        </button>
        <ul className="dropdown-menu absolute hidden text-white pt-1">
          <li className=""><a className="rounded-t theme-bg-color hover:theme-bg-active-color py-2 px-4 block whitespace-no-wrap text-white" href="#">WHY US</a></li>
          <li className=""><a className="theme-bg-color hover:theme-bg-active-color py-2 px-4 block whitespace-no-wrap text-white" href="#">ROADMAP</a></li>
          <li className=""><a className="theme-bg-color hover:theme-bg-active-color py-2 px-4 block whitespace-no-wrap text-white" href="#">BENEFITS</a></li>
          <li className=""><a className="theme-bg-color hover:theme-bg-active-color py-2 px-4 block whitespace-no-wrap text-white" href="#">ATTRIBUTES</a></li>
          <li className=""><a className="theme-bg-color hover:theme-bg-active-color py-2 px-4 block whitespace-no-wrap text-white" href="#">TEAM</a></li>
          <li className=""><a className="theme-bg-color hover:theme-bg-active-color py-2 px-4 block whitespace-no-wrap text-white" href="#">FAQ</a></li>
          <li className=""><a className="theme-bg-color hover:theme-bg-active-color py-2 px-4 block whitespace-no-wrap text-white" href="#">LANUCHPAD</a></li>
          <li className=""><a className="rounded-b theme-bg-color hover:theme-bg-active-color py-2 px-4 block whitespace-no-wrap text-white" href="#">MARKETPLACE</a></li>
        </ul>
      </div>
      </>
    }
    <button className="button-connect">
      CONNECT WALLET
    </button>
  </div>;
}

export default Header;