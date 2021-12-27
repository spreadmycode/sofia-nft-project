import Head from 'next/head'
import { Fragment, useState, useRef, useEffect } from "react";
import { Toaster } from 'react-hot-toast';
import { useWallet } from "@solana/wallet-adapter-react";
import useCandyMachine from '../hooks/use-candy-machine';
import Header from '../components/header';
import Footer from '../components/footer';
import useWalletBalance from '../hooks/use-wallet-balance';
import Countdown from 'react-countdown';
import toast from 'react-hot-toast';
import { useWindowSize } from '../hooks/use-window-size';
import { useHorizontalScroll } from '../hooks/use-horizontal-scroll';
import { useLocalStorage } from '@solana/wallet-adapter-react';
import { Dialog, Transition } from '@headlessui/react';
import useAffiliation from '../hooks/use-affiliation';
import { AFFILIATION_CODE_LEN, NORMALSALE_MAX_NFT_HOLD_COUNT, OWNER_AFFLIATION_CODE, PRESALE_MAX_NFT_HOLD_COUNT, PRESALE_SOLD_LIMIT_COUNT } from '../utils/constant';
import { getNftHoldCount } from '../utils/candy-machine';
import * as anchor from "@project-serum/anchor";

const affiliationPeriod = (Number(process.env.NEXT_PUBLIC_AFFILIATION_PERIOD) == 1);
const presalePeriod = (Number(process.env.NEXT_PUBLIC_PRESALE_PERIOD) == 1);
const treasuryPubkey = process.env.NEXT_PUBLIC_TREASURY_ADDRESS;
const rpcHost = process.env.NEXT_PUBLIC_SOLANA_RPC_HOST!;
const connection = new anchor.web3.Connection(rpcHost);

const Home = () => {
  const wallet = useWallet();
  const [balance] = useWalletBalance();
  const [isActive, setIsActive] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const { isSoldOut, mintStartDate, isMinting, onMintNFT, nftsData } = useCandyMachine();

  const {width, height} = useWindowSize();
  const [tag, setTag] = useLocalStorage('TAG', '');
  const { isAffiliationLoading, getCodeByWallet, getPubKeyByCode, insertCode } = useAffiliation();
  const [isGetNftHoldCount, setIsGetNftHoldCount] = useState(false);
  const [maxNftHoldCount, setMaxNftHoldCount] = useState(PRESALE_MAX_NFT_HOLD_COUNT);
  
  const [code, setCode] = useState('');
  const [visibleAffiliationModal, setVisibleAffiliationModal] = useState(false);
  const [visibleCheckModal, setVisibleCheckModal] = useState(false);
  const cancelButtonRef = useRef(null);
  const [activeFaqIndex, setActiveFaqIndex] = useState(-1);

  const whyusRef = useRef(null);
  const roadmapRef = useHorizontalScroll();
  const benefitsRef = useRef(null);
  const attributesRef = useRef(null);
  const teamRef = useRef(null);
  const faqRef = useRef(null);
  const mintRef = useRef(null);

  // Handlers
  const handleMintButtonClicked = () => {
    if (!wallet.connected) {
      toast.error("Please connect wallet first.");
      return;
    }

    if (isSoldOut) {
      toast.success("Sorry. Panda Warriors are sold out.");
      return;
    }

    if (!isActive) {
      toast.success("Sorry. Please wait for a Pre-Sale day.");
      return;
    }

    if (affiliationPeriod) {
      toast.success("Minting date will be announced soon, stay tuned!", { duration: 6000});
      return;
    }

    if (presalePeriod) {
      if (nftsData.itemsRedeemed >= PRESALE_SOLD_LIMIT_COUNT) {
        toast.success("Pre Sale is ended up. Please wait for public sale.", { duration: 6000});
        return;
      }
      
      setMaxNftHoldCount(PRESALE_MAX_NFT_HOLD_COUNT);

    } else {
      setMaxNftHoldCount(NORMALSALE_MAX_NFT_HOLD_COUNT);
    }

    setCode("");
    setQuantity(1);
    setVisibleCheckModal(true);
  }

  const handleFaq = (index: number) => {
    if (index == activeFaqIndex) {
        setActiveFaqIndex(-1);
    } else {
        setActiveFaqIndex(index);
    }
  }

  const handleGetReferralCode = async () => {
    if (wallet.connected) {
      
      const existCode = await getCodeByWallet(wallet);

      if (existCode == '') {
        setCode("");
        setVisibleAffiliationModal(true);
      } else {
        toast.success(`You have already generated code: ${existCode}`, { duration: 6000});
      }
    } else {
      toast.error("Please connect wallet first.");
    }
  }

  const handleGenerateCode = async () => {
    if (code.length != AFFILIATION_CODE_LEN) {
      toast.error(`Code should be ${AFFILIATION_CODE_LEN} letters(digits and chars).`, { duration: 4000});
      return;
    }

    const existPubkey = await getPubKeyByCode(code);

    if (existPubkey == '') {
      
      await insertCode(wallet, code);

      toast.success(`You successfully generated code: ${code}`, { duration: 6000});

      setVisibleAffiliationModal(false);
    } else {
      toast.error("This code is aready existed.", { duration: 4000});
    }
  }

  const handleCheckCode = async () => {
    if (code.length != AFFILIATION_CODE_LEN) {
      toast.error(`Code should be ${AFFILIATION_CODE_LEN} letters(digits and chars).`, { duration: 4000});
      return;
    }

    const existPubkey = await getPubKeyByCode(code);

    if (existPubkey == '') {
      toast.error("This code is not existed.", { duration: 4000});
    } else {

      if (existPubkey == wallet.publicKey?.toBase58()) {
        toast.error("You can't use your own code for mint.", { duration: 4000});
        return;
      }

      setVisibleCheckModal(false);
      
      let nftHoldCount = 0;
      if (wallet.publicKey) {
        setIsGetNftHoldCount(true);

        // Get currently hold PW count
        nftHoldCount = await getNftHoldCount(connection, wallet.publicKey);

        setIsGetNftHoldCount(false);
      } else {
        toast.error("Mint failed. Please try again.");
        return;
      }

      let possibleQuantity = maxNftHoldCount - nftHoldCount;
      if (possibleQuantity <= 0) {
        toast.error(`You can't mint more Panda Warriors with this wallet. Connect another wallet to mint more.`, { duration: 6000});
        return;
      }

      if (quantity > possibleQuantity) {
        toast.error(`You can't mint more Panda Warriors with this wallet. Connect another wallet to mint more.`, { duration: 6000});
        return;
      }

      if (presalePeriod && ((nftsData.itemsRedeemed + quantity) > PRESALE_SOLD_LIMIT_COUNT)) {
        toast.error(`You can't mint more Panda Warriors. Because of reaching out the limit for Pre-Sale.`, { duration: 6000});
        return;
      }

      await onMintNFT(quantity, existPubkey);
    }
  }

  const scrollToRef = (ref: any) => {
    window.scroll(
        {
          top: ref.current.offsetTop,
          behavior: "smooth",
        }
    );
  };

  useEffect(() => {
    (async () => {
      if (tag == '') return;
      switch (tag) {
        case 'WHYUS':
          scrollToRef(whyusRef);
          break;
        case 'ROADMAP':
          scrollToRef(roadmapRef);
          break;
        case 'BENEFITS':
          scrollToRef(benefitsRef);
          break;
        case 'ATTRIBUTES':
          scrollToRef(attributesRef);
          break;
        case 'TEAM':
          scrollToRef(teamRef);
          break;
        case 'FAQ':
          scrollToRef(faqRef);
          break;
        case 'MINT':
          scrollToRef(mintRef);
          break;
      }

      setTag('');
    })();
  }, []);

  return (
    <main>
      <Toaster />

      <Head>
        <title>Panda Warriors</title>
        <meta name="description" content="Panda Warriors is a collection of 10,000 generated NFTs, living on the Solana Blockchain, each asset is hand-drawn from scratch by a talented group of artists. Every art piece present on our website is hand-drawn by us. Each Panda Warrior is your lucky NFTicket, that will grow in value every phase of the Panda Warriors project development. Be a part of our journey full of adventures and fun." />
        <link rel="icon" href="/icon.png" />
      </Head>

      <Header whyusRef={whyusRef} roadmapRef={roadmapRef} benefitsRef={benefitsRef} attributesRef={attributesRef} teamRef={teamRef} faqRef={faqRef} mintRef={mintRef} />

      {(width > 768) ?
      <section>
        <div className="w-full md:h-screen flex justify-center items-end background-overview-section">
          <div>
            <h3 className="text-white text-center overview-title drop-shadow-lg">PANDA WARRIORS</h3>
            <p className="text-white text-center overview-desc px-5 md:px-24">
              Panda Warriors is a collection of 10,000 generated NFTs, living on the Solana Blockchain, each asset is hand-drawn from scratch by a talented group of artists. Every art piece present on our website is hand-drawn by us. Each Panda Warrior is your lucky NFTicket, that will grow in value every phase of the Panda Warriors project development. Be a part of our journey full of adventures and fun.
            </p>
          </div>
        </div>
      </section>
      :
      <section>
        <div className="w-full flex justify-center items-center">
          <img src={'/images/background.png'} width="100%" />
        </div>
        <div className="">
          <h3 className="text-white text-center overview-title drop-shadow-lg">PANDA WARRIORS</h3>
          <p className="text-white text-center overview-desc px-5 md:px-24">
            Panda Warriors is a collection of 10,000 generated NFTs, living on the Solana Blockchain, each asset is hand-drawn from scratch by a talented group of artists. Every art piece present on our website is hand-drawn by us. Each Panda Warrior is your lucky NFTicket, that will grow in value every phase of the Panda Warriors project development. Be a part of our journey full of adventures and fun.
          </p>
        </div>
      </section>
      }
      
      <section>
        <div className="w-full md:h-screen flex justify-center items-end relative px-5 md:px-10">
          <div className="h-4/5 z-order-content">
            <div className="flex flex-col md:flex-row h-5/6">
              <div className="flex justify-center items-end">
                <img src={'/images/art1.png'} />
              </div>
              <div className="flex justify-center items-start">
                <img src={'/images/art2.png'} />
              </div>
              <div className="flex justify-center items-end">
                <img src={'/images/art3.png'} />
              </div>
              <div className="flex justify-center items-start">
                <img src={'/images/art4.png'} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 mt-16">
              <a href="https://discord.com/invite/EaefjHZJKH" target="_blank" className="m-2 col-span-1 md:col-start-2 z-order-top">
                <button className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded inline-flex items-center justify-center py-2 space-x-2 w-full">
                  <img src={'/images/icon_button_discord.png'} width={20} height={20} />
                  <span>Join Discord</span>
                </button>
              </a>
              <button className="border-gray-500 hover:border-white text-white border font-bold m-2 rounded py-2 col-span-1 md:col-start-3 z-order-top" onClick={handleGetReferralCode}>
                GET REFERRAL CODE
              </button>
            </div>
          </div>          
        </div>
      </section>

      {/* <section>
        <div className="w-full md:h-screen flex flex-col md:flex-row justify-center items-center p-10 space-x-5">
          <div className="z-order-content">
            <h5 className="text-white presale-title drop-shadow-lg">PANDA WARRIORS PRE-SALE</h5>
            <p className="text-white presale-desc">
              Be the first to get your hands on the Panda Warriors NFT. Limited 1500 registration passes with max 3 NFT per wallet.
              <br />
              <br />
              Special early adopters price 1 SOL.
            </p>
            <a href="https://forms.gle/WPXZiMiiGPUeeHX18" target="_blank">
              <button className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded inline-flex items-center justify-center w-52 py-2 space-x-2 mt-10">
                <span>Be the First</span>
                <img src={'/images/icon_missile.png'} width={20} height={20} />
              </button>
            </a>
          </div>
          <div className="flex justify-center items-center w-full md:w-2/5 mt-5">
            <img src={'/images/panda.png'} />
          </div>
        </div>
      </section> */}

      <section ref={mintRef}>
        <div className="w-full">
          <h5 className="text-white presale-title drop-shadow-lg text-center">PRE-SALE <span className="text-yellow-500">1SOL</span></h5>
          <div className="panel-mint">
            <div className="panel-mint-background">
              <img src={'/images/panel_mint.png'} />
              <div className="panel-mint-button">
                <button className="panel-mint-button-ref" onClick={handleMintButtonClicked}><div></div></button>
              </div>
            </div>
          </div>
          {
            isActive ?
              <p className="presale-desc text-white text-center">
                {/* PW Minted / Total : {nftsData.itemsRedeemed} / {nftsData.itemsAvailable} */}
              </p>
            :
              <Countdown
                date={mintStartDate}
                onMount={({ completed }) => completed && setIsActive(true)}
                onComplete={() => setIsActive(true)}
                renderer={renderCounter}
              />
          }
        </div>
      </section>

      <section ref={whyusRef}>
        <div className="w-full px-10">
          <h3 className="text-section-title pb-10">WHY PANDA WARRIORS</h3>
          <div className="w-full flex md:justify-start items-center mb-10 z-order-content">
            <div className="md:w-3/4 flex flex-row p-5 space-x-5 border border-white panel-why-border-radius">
              <div className="w-3/4">
                <h5 className="panel-why-desc-title">OUR MISSION</h5>
                <p className="panel-why-desc-text">Build an Ecosystem that synergy Utilities, Knowledge, Experience and Longevity, making each member in our Community a winner. Providing necessary tools that will let each active member of PW Community enter a Millionaire Club one day.</p>
              </div>
              <div className="w-1/4 flex justify-center items-center">
                <img src={'/images/overview1.png'} />
              </div>
            </div>
          </div>
          <div className="w-full flex md:justify-end items-center mb-10 z-order-content">
            <div className="md:w-3/4 flex flex-row p-5 space-x-5 border border-white panel-why-border-radius">
              <div className="w-3/4">
                <h5 className="panel-why-desc-title">UTILITY</h5>
                <p className="panel-why-desc-text">We believe NFTs have massive potential and impact. Apart from being a nice art, Panda Warriors NFTs caries several utilities. Panda Warriors is your NFTicket that grants access to the PW Privilege Club,  PW LaunchPad access, gateway to the Metaverse and other ongoing utilities to be reviled as we move forward.</p>
              </div>
              <div className="w-1/4 flex justify-center items-center">
                <img src={'/images/overview2.png'} />
              </div>
            </div>
          </div>
          <div className="w-full flex md:justify-start items-center mb-10 z-order-content">
            <div className="md:w-3/4 flex flex-row p-5 space-x-5 border border-white panel-why-border-radius">
              <div className="w-3/4">
                <h5 className="panel-why-desc-title">EXPERIENCE</h5>
                <p className="panel-why-desc-text">Experience plays a significant role in our project. Therefore, we are working on creating multiple experiences for our Community along the way. Starting from knowing each other and learning from each other, organizing virtual and live meetups, gaining valuable knowledge from experts, moving to the Metaverse together (building a Panda Village), playing games and so much more…</p>
              </div>
              <div className="w-1/4 flex justify-center items-center">
                <img src={'/images/overview3.png'} />
              </div>
            </div>
          </div>
          <div className="w-full flex md:justify-end items-center mb-10 z-order-content">
            <div className="md:w-3/4 flex flex-row p-5 space-x-5 border border-white panel-why-border-radius">
              <div className="w-3/4">
                <h5 className="panel-why-desc-title">LONGEVITY</h5>
                <p className="panel-why-desc-text">Panda Warriors are having a long way to go. Many will come, but only true Warriors will stay, those who understand our vision, contribute to our mission and support the community growth. Only by building a strong army of Warriors, we can achieve bigger goals together. To support the community growth, we will implement a buy-back function to raise the floor, stimulate community growth by rewarding leaders, investing in project development, building new utilities, creating new experiences. Our priority is to let every member of the community succeed. <br/><br/>Our MOTO: “EVERYONE WINS”.</p>
              </div>
              <div className="w-1/4 flex justify-center items-center">
                <img src={'/images/overview4.png'} />
              </div>
            </div>
          </div>
          <div className="w-full flex md:justify-start items-center mb-10 z-order-content">
            <div className="md:w-3/4 flex flex-row p-5 space-x-5 border border-white panel-why-border-radius">
              <div className="w-3/4">
                <h5 className="panel-why-desc-title">KNOWLEDGE</h5>
                <p className="panel-why-desc-text">We believe that knowledge is the power, and the sooner you can obtain certain information, the more successful you become. Therefore, we created the PW Privilege Club - where each member gets access to valuable information and consistently learns from professionals in the industry. Being a member, you will have the privilege to meet experts in the crypto space, NFT, Metaverse and others. Get access to the knowledge you need to become successful in this fast-moving real-virtual reality.</p>
              </div>
              <div className="w-1/4 flex justify-center items-center">
                <img src={'/images/overview5.png'} />
              </div>
            </div>
          </div>
          <div className="w-full flex md:justify-end items-center z-order-content">
            <div className="md:w-3/4 flex flex-row p-5 space-x-5 border border-white panel-why-border-radius">
              <div className="w-3/4">
                <h5 className="panel-why-desc-title">GROWTH</h5>
                <p className="panel-why-desc-text">The Power of the Word of Mouth is our strength. We believe in the power of organic community growth, where members spread the word as they truly support the project, being PW holders themselves. Therefore, those Warriors who contribute to the community growth will always be rewarded. Starting from now, the Associate’s Program has been implemented. Becoming an Associate, you will get 10% of each NFT mint with your Unique Code. (Read details in FAQs)</p>
              </div>
              <div className="w-1/4 flex justify-center items-center">
                <img src={'/images/overview6.png'} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section ref={roadmapRef} className="section-roadmap">
        <div className="panel-roadmap">
          <div className="panel-roadmap-image">
            <img src={'/images/roadmap1.jpg'} width={(width > 768) ? "100%" : '768px'} />
          </div>
          <div className="panel-roadmap-image">
            <img src={'/images/roadmap2.jpg'} width={(width > 768) ? "100%" : '768px'} />
          </div>
          <div className="panel-roadmap-image">
            <img src={'/images/roadmap3.jpg'} width={(width > 768) ? "100%" : '768px'} />
          </div>
          <div className="panel-roadmap-image">
            <img src={'/images/roadmap4.jpg'} width={(width > 768) ? "100%" : '768px'} />
          </div>
          <div className="panel-roadmap-image">
            <img src={'/images/roadmap5.jpg'} width={(width > 768) ? "100%" : '768px'} />
          </div>
        </div>
      </section>

      <section ref={benefitsRef}>
        <div className="w-full px-10 py-10">
          <h3 className="text-section-title pb-5">BENEFITS</h3>
          <p className="text-section-desc pb-16">WHY HOLDING PANDA WARRIORS?</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2 panel-benefit flex flex-col space-y-2 p-5 panel-why-border-radius">
              <div className="flex justify-start items-center">
                <img src={'/images/benefits1.png'} className="image-benefit" />
              </div>
              <h5 className="panel-why-desc-title">100% ROYALTY FOR THE COMMUNITY.</h5>
              <p className="panel-why-desc-text">10% royalty from the secondary sales. 100% of Royalties collected in the Community Royalty Pool. Royalty Pool will be used for the community growth, project development and awesome airdrops.</p>
              <div className="panel-benefit-background-tree w-1/4 h-full"></div>
            </div>

            <div className="md:col-span-1 panel-benefit flex flex-col space-y-2 p-5 panel-why-border-radius">
              <div className="flex justify-start items-center">
                  <img src={'/images/benefits2.png'} className="image-benefit" />
              </div>
              <h5 className="panel-why-desc-title">PW RAFFLE GAMES</h5>
              <p className="panel-why-desc-text">PW NFT is your lucky NFTicket to enter the Raffle and WIN a piece of a virtual Land in one of the Top Metaverses (along with other valuable assets). 12 Raffle Games will be played during 12 months after minting. 1 PW = 12 Entries.</p>
            </div>

            <div className="md:col-span-1 panel-benefit flex flex-col space-y-2 p-5 panel-why-border-radius">
              <div className="flex justify-start items-center">
                  <img src={'/images/benefits3.png'} className="image-benefit" />
              </div>
              <h5 className="panel-why-desc-title">PANDA FRIENDS REWARDS</h5>
              <p className="panel-why-desc-text">100 Lucky Panda Warriors holders will be airdropped upcoming Panda Friends NFTs. Panda Friends coming with a purpose...</p>
            </div>

            <div className="md:col-span-2 panel-benefit flex flex-col space-y-2 p-5 panel-why-border-radius">
              <div className="flex justify-start items-center">
                <img src={'/images/benefits4.png'} className="image-benefit" />
              </div>
              <h5 className="panel-why-desc-title">TREASURE BOX</h5>
              <p className="panel-why-desc-text">The Treasure Crypto Box will be filled with 2000 sol (once all 10,000 Panda Warriors has been successfully minted). Community Treasury will be reinvested in buying Virtual Lands & Virtual Estate in the Top Metaverses and highly-potential projects. By holding a Panda Warrior, you will be able to get benefits of owning  a part of a Vistula Land in multiple Metaverses + other ongoing benefits.</p>
              <div className="panel-benefit-background-tree w-1/4 h-full"></div>
            </div>

            <div className="md:col-span-1 panel-benefit flex flex-col space-y-2 p-5 panel-why-border-radius">
              <div className="flex justify-start items-center">
                  <img src={'/images/benefits5.png'} className="image-benefit" />
              </div>
              <h5 className="panel-why-desc-title">PW LAUNCHPAD</h5>
              <p className="panel-why-desc-text">Grant access to new high-potential NFT projects first, receive airdrops and get whitelisted, by holding Panda Warriors.</p>
            </div>
            
            <div className="md:col-span-1 panel-benefit flex flex-col space-y-2 p-5 panel-why-border-radius">
              <div className="flex justify-start items-center">
                  <img src={'/images/benefits6.png'} className="image-benefit" />
              </div>
              <h5 className="panel-why-desc-title">SMART TOOL</h5>
              <p className="panel-why-desc-text">Holders will get exclusive access to our smart tools that will help you successfully analyze, mint and profitably trade NFTs across multiple blockchains, as well as save your time & money on research and many more.</p>
            </div>

            <div className="md:col-span-1 flex justify-center items-center">
              <div className="flex flex-col space-y-2">
                <div className="flex justify-center items-center">
                  <img src={'/images/benefits7.png'} width='70%' />
                </div>
                <h5 className="panel-why-desc-title text-center">Coming Soon...</h5>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section ref={attributesRef}>
        <div className="w-full relative background-traits-section">
          <div className="pandagif-block">
            <img src={'/images/pwSlideshow.gif'} />
          </div>
          <div className="panel-trait flex justify-center">
            <div className="flex flex-col space-y-2">
              <h3 className="text-white text-center text-section-title drop-shadow-lg">TRAITS</h3>
              <p className="text-white text-center overview-desc px-5 md:px-32">
                Panda Warriors NFT Collection is generated out of 240 different hand-drawn traits. Some traits are rarer than others, classifying all 10,000 Panda Warriors rarity from common, uncommon, rare to super rare. There are only 12 unique 1 of 1 Panda Warriors NFTs that having 100% exclusive combination of traits, making them one-of-a-kind pieces. The traits include background, body skin, bodywear, eyes, ears, hat, mouth shape, mouth accessories, tools. Soon after minting, you will be able to check the rarity score of your Panda Warriors and find out how rare your Panda Warrior is.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section ref={teamRef}>
        <div className="w-full px-10">
          <h3 className="text-section-title pb-10">TEAM</h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="col-span-1 flex flex-col space-y-2">
              <div className="w-full flex justify-center items-center">
                <img src={'/images/team1.png'} />
              </div>
              <p className="text-team-name">Artists Team</p>
              <div className="w-full flex justify-center items-center space-x-2">
                <a href="https://twitter.com/shawdycus" target="_blank" className="inline-flex text-center space-x-2"><img src={'/images/icon_twitter.png'} width="30" height="30" /></a>
                <a href="https://www.instagram.com/sean.schnrd" target="_blank" className="inline-flex text-center space-x-2"><img src={'/images/icon_instagram.png'} width="30" height="30" /></a>
                <a href="https://instagram.com/yokune.7?utm_medium=copy_link" target="_blank" className="inline-flex text-center space-x-2"><img src={'/images/icon_instagram.png'} width="30" height="30" /></a>
              </div>
            </div>

            <div className="col-span-1 flex flex-col space-y-2">
              <div className="w-full flex justify-center items-center">
                <img src={'/images/team2.png'} />
              </div>
              <p className="text-team-name">Project Management Team</p>
              <div className="w-full flex justify-center items-center">
                <a href="https://twitter.com/pwninja_nft" target="_blank" className="inline-flex text-center space-x-2"><img src={'/images/icon_twitter.png'} width="30" height="30" /></a>
              </div>
            </div>

            <div className="col-span-1 flex flex-col space-y-2">
              <div className="w-full flex justify-center items-center">
                <img src={'/images/team3.png'} />
              </div>
              <p className="text-team-name">Blockchain Devs Team</p>
              <div className="w-full flex justify-center items-center">
                <a href="https://discord.gg/JDC3mZdswF" target="_blank" className="inline-flex text-center space-x-2"><img src={'/images/icon_discord.png'} width="30" height="30" /></a>
              </div>
            </div>

            <div className="col-span-1 flex flex-col space-y-2">
              <div className="w-full flex justify-center items-center">
                <img src={'/images/team4.png'} />
              </div>
              <p className="text-team-name">Marketing Team</p>
              <div className="w-full flex justify-center items-center space-x-2">
                <a href="https://twitter.com/PWFlythe" target="_blank" className="inline-flex text-center space-x-2"><img src={'/images/icon_twitter.png'} width="30" height="30" /></a>
                <a href="https://www.instagram.com/pw.cloudy/?utm_medium=copy_link" target="_blank" className="inline-flex text-center space-x-2"><img src={'/images/icon_instagram.png'} width="30" height="30" /></a>
              </div>
            </div>
          </div>

          <p className="text-team-desc py-10 px-5 md:px-32">
            Our international team is a synergy of professional artists, experienced blockchain developers, web developers, project management team, marketing team, discord and social media team -  all working hard to make sure our Panda Warriors Community is getting the best experience and benefits, making our project one-of-a-kind. Our team is constantly expanding along with the project and the community. 
          </p>
        </div>
      </section>

      <section ref={faqRef}>
        <div className="w-full px-5 md:px-16 pb-10 relative">
          <h3 className="text-section-title pb-10">FAQ'S</h3>

          <div className="panel-faq">
            <div className={activeFaqIndex == 0 ? 'faq active-faq' : 'faq'}>
                <div className='faq-header' onClick={() => handleFaq(0)}>
                    <div>When Panda Warriors can be mine?</div>
                    <div className='faq-icon'>{activeFaqIndex == 0 ? <img src={'/images/icon_faq_active.png'} width='20' /> : <img src={'/images/icon_faq.png'} width='12' />}</div>
                </div>
                <div className={activeFaqIndex == 0 ? 'active-faq-content' : 'faq-content'}>The Launch Day will be announced on Twitter, Discord and on the official Panda Warriors Website. Stay Tuned not to miss!</div>
            </div>
            <div className={activeFaqIndex == 1 ? 'faq active-faq' : 'faq'}>
                <div className='faq-header' onClick={() => handleFaq(1)}>
                    <div>How to Get Panda Warriors NFT for FREE?</div>
                    <div className='faq-icon'>{activeFaqIndex == 1 ? <img src={'/images/icon_faq_active.png'} width='20' /> : <img src={'/images/icon_faq.png'} width='12' />}</div>
                </div>
                <div className={activeFaqIndex == 1 ? 'active-faq-content' : 'faq-content'}>If you are a true Panda Warrior and wish to adopt your Panda Warrior before a Minting Day, you can get your Panda Warrior for FREE by participating in our GIVEAWAYS on Twitter and Discord. All you need to do is stay active, comment. share, retweet, and let’s grow our Panda Warriors Community together</div>
            </div>
            <div className={activeFaqIndex == 2 ? 'faq active-faq' : 'faq'}>
                <div className='faq-header' onClick={() => handleFaq(2)}>
                    <div>What “Associates Program” is about and how I can benefit?</div>
                    <div className='faq-icon'>{activeFaqIndex == 2 ? <img src={'/images/icon_faq_active.png'} width='20' /> : <img src={'/images/icon_faq.png'} width='12' />}</div>
                </div>
                <div className={activeFaqIndex == 2 ? 'active-faq-content' : 'faq-content'}>The Associate Program was created as a way to stimulate consistent community growth and reward active Warriors (Leaders) who believes in our future and contributes to the community the most. We want every single member, who spread the word about Panda Warriors organically, to be rewarded. Share the information about PW with your friends and get 10% from each NFT mint with your unique code instantly to your wallet on a day of a private/public minting. It doesn’t stop there, once 100% PW Warriors are minted, top community leaders (who got the most amount of mints) will be Rewarded. If you joined our community later, you can still participate in PW Associates Program and build your way to become a Community Leader. This will always be beneficial. You can learn more about it in our discord by visiting the [Affiliate Channel].</div>
            </div>
            <div className={activeFaqIndex == 3 ? 'faq active-faq' : 'faq'}>
                <div className='faq-header' onClick={() => handleFaq(3)}>
                    <div>What is a Public Mint Price?</div>
                    <div className='faq-icon'>{activeFaqIndex == 3 ? <img src={'/images/icon_faq_active.png'} width='20' /> : <img src={'/images/icon_faq.png'} width='12' />}</div>
                </div>
                <div className={activeFaqIndex == 3 ? 'active-faq-content' : 'faq-content'}>Mint Price is 1.5 SOL.</div>
            </div>
            <div className={activeFaqIndex == 4 ? 'faq active-faq' : 'faq'}>
                <div className='faq-header' onClick={() => handleFaq(4)}>
                    <div>Is there a PRE-SALE?</div>
                    <div className='faq-icon'>{activeFaqIndex == 4 ? <img src={'/images/icon_faq_active.png'} width='20' /> : <img src={'/images/icon_faq.png'} width='12' />}</div>
                </div>
                <div className={activeFaqIndex == 4 ? 'active-faq-content' : 'faq-content'}>Special early adopters price 1 SOL. If you would like to mint more PWs, you can still participate in a Public Mint.</div>
            </div>
            <div className={activeFaqIndex == 5 ? 'faq active-faq' : 'faq'}>
                <div className='faq-header' onClick={() => handleFaq(5)}>
                    <div>Where will Panda Warriors Live?</div>
                    <div className='faq-icon'>{activeFaqIndex == 5 ? <img src={'/images/icon_faq_active.png'} width='20' /> : <img src={'/images/icon_faq.png'} width='12' />}</div>
                </div>
                <div className={activeFaqIndex == 5 ? 'active-faq-content' : 'faq-content'}>Our Panda Warriors will live on Solana Blockchain - a beautiful place with low gas fees, fast transactions and huge growth potential. All Panda Warriors NFTs images are safely stored on the Arweave forever. </div>
            </div>
            <div className={activeFaqIndex == 6 ? 'faq active-faq' : 'faq'}>
                <div className='faq-header' onClick={() => handleFaq(6)}>
                    <div>Why should I HODL my Panda Warriors after minting?</div>
                    <div className='faq-icon'>{activeFaqIndex == 6 ? <img src={'/images/icon_faq_active.png'} width='20' /> : <img src={'/images/icon_faq.png'} width='12' />}</div>
                </div>
                <div className={activeFaqIndex == 6 ? 'active-faq-content' : 'faq-content'}>
                  Hodling your Panda Warriors will grant access to the following rewards (read details in BENEFITS):
                  <br />
                  <br />
                  <ul className="faq-list">
                    <li>100% Royalty Pool</li>
                    <li>Treasure Box</li>
                    <li>Monthly Raffle Games</li>
                    <li>Panda Friends Rewards</li>
                    <li>PW Launchpad</li>
                    <li>And other ongoing rewards...</li>
                  </ul>
                </div>
            </div>
            <div className={activeFaqIndex == 7 ? 'faq active-faq' : 'faq'}>
                <div className='faq-header' onClick={() => handleFaq(7)}>
                    <div>How many Panda Warriors can I mint?</div>
                    <div className='faq-icon'>{activeFaqIndex == 7 ? <img src={'/images/icon_faq_active.png'} width='20' /> : <img src={'/images/icon_faq.png'} width='12' />}</div>
                </div>
                <div className={activeFaqIndex == 7 ? 'active-faq-content' : 'faq-content'}>Each wallet can mint up to 5 PW per wallet and max 5 PW per transaction. </div>
            </div>
            <div className={activeFaqIndex == 8 ? 'faq active-faq' : 'faq'}>
                <div className='faq-header' onClick={() => handleFaq(8)}>
                    <div>Will Panda Warriors be listed on the secondary market?</div>
                    <div className='faq-icon'>{activeFaqIndex == 8 ? <img src={'/images/icon_faq_active.png'} width='20' /> : <img src={'/images/icon_faq.png'} width='12' />}</div>
                </div>
                <div className={activeFaqIndex == 8 ? 'active-faq-content' : 'faq-content'}>Yes! Once minting of all Panda Warriors is completed, a secondary marketplace will open its doors for you to trade your PWs. Soon after 100% minting,  our own PW Marketplace will be open! Stay Tuned.</div>
            </div>
            <div className={activeFaqIndex == 9 ? 'faq active-faq' : 'faq'}>
                <div className='faq-header' onClick={() => handleFaq(9)}>
                    <div>How to regulate the floor price on the Secondary market?</div>
                    <div className='faq-icon'>{activeFaqIndex == 9 ? <img src={'/images/icon_faq_active.png'} width='20' /> : <img src={'/images/icon_faq.png'} width='12' />}</div>
                </div>
                <div className={activeFaqIndex == 9 ? 'active-faq-content' : 'faq-content'}>To ensure the floor price is stable and not dropping below the mint price, Panda Warriors NFTs that were listed below the minting price on the secondary market will be bought - back. Don’t rush to sell your Panda Warrior below its value, not to miss bigger rewards in a long run. Other measures to stimulate a healthy floor price will be implemented as well. Panda Warrior’s holders that have active listings below mint price (below 1.5 sol) on a secondary market, will not be eligible for the benefits listed above (monthly raffle games, airdrops, royalty pool bonus)</div>
            </div>
            <div className={activeFaqIndex == 10 ? 'faq active-faq' : 'faq'}>
                <div className='faq-header' onClick={() => handleFaq(10)}>
                    <div>Who is behind the project?</div>
                    <div className='faq-icon'>{activeFaqIndex == 10 ? <img src={'/images/icon_faq_active.png'} width='20' /> : <img src={'/images/icon_faq.png'} width='12' />}</div>
                </div>
                <div className={activeFaqIndex == 10 ? 'active-faq-content' : 'faq-content'}>Our international team is a synergy of talented artists, experienced developers, business development professionals, marketers and moderators -  all working hard to make sure our Panda Warriors Community is getting the best experience and benefits, making our project one-of-a-kind. Our team will be growing along with the project and the community. </div>
            </div>
          </div>

          <div className="panel-faq-background-tree w-1/3 h-3/4"></div>
        </div>
      </section>

      <Footer />

      <Transition.Root show={visibleAffiliationModal} as={Fragment}>
        <Dialog as="div" className="fixed z-10 inset-0 overflow-y-auto" initialFocus={cancelButtonRef} onClose={setVisibleAffiliationModal}>
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </Transition.Child>

            {/* This element is to trick the browser into centering the modal contents. */}
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                        Generate Your Referral Code
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Create your Unique Code (UC) and share it with your friends. Get 10% reward of each NFT minted with your UC! You can’t use your own code for minting, someone has to invite you as well. If nobody invited you, contact us on Discord and get UC to mint your NFT.
                        </p>
                        <input maxLength={6} minLength={6} value={code} onChange={(e) => {setCode(e.target.value)}} className="shadow appearance-none border border-gray-400 rounded w-full py-2 px-3 text-black mt-5 leading-tight focus:outline-none focus:shadow-outline text-center" type="text" placeholder={`${AFFILIATION_CODE_LEN} Letters(digits and chars)`} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-yellow-500 text-base font-medium text-white hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={handleGenerateCode}
                  >
                    Generate
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => setVisibleAffiliationModal(false)}
                    ref={cancelButtonRef}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      <Transition.Root show={visibleCheckModal} as={Fragment}>
        <Dialog as="div" className="fixed z-10 inset-0 overflow-y-auto" initialFocus={cancelButtonRef} onClose={setVisibleCheckModal}>
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </Transition.Child>

            {/* This element is to trick the browser into centering the modal contents. */}
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                        Enter the Invitation Code
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Please enter the Invitation code, that you received from a person, who invited you to Panda Warriors NFT Community. If you do not have an Invite Code, press here<button type="button" className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm" onClick={() => {setCode(OWNER_AFFLIATION_CODE)}}>Get Code</button>
                        </p>
                        <input maxLength={6} minLength={6} value={code} onChange={(e) => {setCode(e.target.value)}} className="shadow appearance-none border border-gray-400 rounded w-full py-2 px-3 text-black mt-5 leading-tight focus:outline-none focus:shadow-outline text-center" type="text" placeholder={`${AFFILIATION_CODE_LEN} Letters(digits and chars)`} />
                      </div>
                      <div className="mt-5 w-full flex justify-center items-center">
                        <div>
                          <p className="text-sm text-gray-500">
                            Select mint amount (1~{maxNftHoldCount}).
                          </p>
                          <input min={1} max={maxNftHoldCount} value={quantity} onChange={(e) => {setQuantity(Number(e.target.value))}} className="shadow appearance-none border border-gray-400 rounded w-full py-2 px-3 mx-auto text-black mt-5 leading-tight focus:outline-none focus:shadow-outline text-center" type="number" placeholder="Mint Amount" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-yellow-500 text-base font-medium text-white hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={handleCheckCode}
                  >
                    Mint
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => setVisibleCheckModal(false)}
                    ref={cancelButtonRef}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {(wallet.connected && (isAffiliationLoading || isGetNftHoldCount || isMinting)) &&
        <div className="w-full h-full fixed block top-0 left-0 bg-black opacity-75 z-50 flex justify-center items-center">
          <div
            className="
              animate-spin
              rounded-full
              h-32
              w-32
              border-t-2 border-b-2 border-yellow-600
            "
          ></div>
        </div>
      }
    </main>
  );
};

const renderCounter = ({ days, hours, minutes, seconds }: any) => {
  return (
    <div className="panel-mint-timer">
      <span>
        {(days > 0) && <span><span className="text-timer-big">{days}</span> <span className="text-timer-small">Days&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></span>}
        {(hours > 0) && <span><span className="text-timer-big">{hours}</span> <span className="text-timer-small">Hrs&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></span>}
        <span><span className="text-timer-big">{minutes}</span> <span className="text-timer-small">Min&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></span>
        <span><span className="text-timer-big">{seconds}</span> <span className="text-timer-small">Sec</span></span>
      </span>
    </div>
  );
};

export default Home;



