import Head from 'next/head'
import { Toaster } from 'react-hot-toast';
import Header from '../components/header';
import { gql, useQuery } from "@apollo/client";
import NftCard from '../components/nft-card';
import { Dialog, Transition } from '@headlessui/react';
import { useState, Fragment, useRef } from 'react';

export const GET_ITEMS = gql`
  query getItems($first: Int, $filters: [String], $after: String, $ids: [Int], $bottom: Int, $top: Int, $sort: String) {
    getItems(first: $first, filters: $filters, after: $after, ids: $ids, bottom: $bottom, top: $top, sort: $sort) {
      pageInfo {
        endCursor
        hasNextPage
        traits
      }
      edges {
        cursor
        node {
          id
          name
          image
          traits
          score
          pos
          hash
        }
      }
    }
  }
`;

let filters: Array<string> = [];
let nftIds: Array<number> = [];
let bottom: number = 0;
let top: number = 0;
const first = 20;
const delay = true;

const Rarity = () => {

  const [visibleDetailModal, setVisibleDetailModal] = useState(false);
  const cancelButtonRef = useRef(null);
  const [nftDetail, setNftDetail] = useState<any>();

  // Search params
  const [ids, setIds] = useState("");
  const [sort, setSort] = useState("");
  const [skin, setSkin] = useState("");
  const [background, setBackground] = useState("");
  const [backgroundProp, setBackgroundProp] = useState("");
  const [clothes, setClothes] = useState("");
  const [leftEar, setLeftEar] = useState("");
  const [eyes, setEyes] = useState("");
  const [eyeSocket, setEyeSocket] = useState("");
  const [mouth, setMouth] = useState("");
  const [rightEar, setRightEar] = useState("");
  const [eyeAccessory, setEyeAccessory] = useState("");
  const [fgProp, setFgProp] = useState("");
  const [headwear, setHeadwear] = useState("");
  const [rankBottom, setRankBottom] = useState("");
  const [rankTop, setRankTop] = useState("");

  const { error, loading, data, networkStatus, fetchMore, refetch } = useQuery(GET_ITEMS, {
    variables: { first, filters, ids: nftIds, bottom, top, sort, delay },
    notifyOnNetworkStatusChange: true,
  });

  let skinS: Array<any> = [];
  let backgroundS: Array<any> = [];
  let backgroundPropS: Array<any> = [];
  let clothesS: Array<any> = [];
  let leftEarS: Array<any> = [];
  let eyesS: Array<any> = [];
  let eyeSocketS: Array<any> = [];
  let mouthS: Array<any> = [];
  let rightEarS: Array<any> = [];
  let eyeAccessoryS: Array<any> = [];
  let fgPropS: Array<any> = [];
  let headwearS: Array<any> = [];

  const hasNextPage = data?.getItems.pageInfo.hasNextPage;
  const isRefetching = networkStatus === 3;
  const traits = data?.getItems.pageInfo.traits;
  if (traits) {
    const attributes = JSON.parse(traits);
    for (let attribute of attributes) {
      if (attribute.trait_type == "Skin") {
        skinS = attribute.values;
      }
      if (attribute.trait_type == "Background") {
        backgroundS = attribute.values;
      }
      if (attribute.trait_type == "Background Prop") {
        backgroundPropS = attribute.values;
      }
      if (attribute.trait_type == "Clothes") {
        clothesS = attribute.values;
      }
      if (attribute.trait_type == "Left Ear") {
        leftEarS = attribute.values;
      }
      if (attribute.trait_type == "Eyes") {
        eyesS = attribute.values;
      }
      if (attribute.trait_type == "Eye Socket") {
        eyeSocketS = attribute.values;
      }
      if (attribute.trait_type == "Mouth") {
        mouthS = attribute.values;
      }
      if (attribute.trait_type == "Right Ear") {
        rightEarS = attribute.values;
      }
      if (attribute.trait_type == "Eye Accessory") {
        eyeAccessoryS = attribute.values;
      }
      if (attribute.trait_type == "FG Prop") {
        fgPropS = attribute.values;
      }
      if (attribute.trait_type == "Headwear") {
        headwearS = attribute.values;
      }
    }
  }

  const handleShowDetail = (detail: any) => {
    let nftData = {
      ...detail,
      traits: JSON.parse(detail.traits)
    };
    setNftDetail(nftData);
    setVisibleDetailModal(true);
  };

  const handleFilter = (type: string) => {
    if (skin != '' && type != 'Skin') {
      filters.push(`"trait_type":"Skin","value":"${skin}"`);
    }
    if (background != '' && type != 'Background') {
      filters.push(`"trait_type":"Background","value":"${background}"`);
    }
    if (backgroundProp != '' && type != 'Background Prop') {
      filters.push(`"trait_type":"Background","value":"${background}"`);
    }
    if (clothes != '' && type != 'Clothes') {
      filters.push(`"trait_type":"Clothes","value":"${clothes}"`);
    }
    if (leftEar != '' && type != 'Left Ear') {
      filters.push(`"trait_type":"Left Ear","value":"${leftEar}"`);
    }
    if (eyes != '' && type != 'Eyes') {
      filters.push(`"trait_type":"Eyes","value":"${eyes}"`);
    }
    if (eyeSocket != '' && type != 'Eye Socket') {
      filters.push(`"trait_type":"Eye Socket","value":"${eyeSocket}"`);
    }
    if (mouth != '' && type != 'Mouth') {
      filters.push(`"trait_type":"Mouth","value":"${mouth}"`);
    }
    if (rightEar != '' && type != 'Right Ear') {
      filters.push(`"trait_type":"Right Ear","value":"${rightEar}"`);
    }
    if (eyeAccessory != '' && type != 'Eye Accessory') {
      filters.push(`"trait_type":"Eye Accessory","value":"${eyeAccessory}"`);
    }
    if (fgProp != '' && type != 'FG Prop') {
      filters.push(`"trait_type":"FG Prop","value":"${fgProp}"`);
    }
    if (headwear != '' && type != 'Headwear') {
      filters.push(`"trait_type":"Headwear","value":"${headwear}"`);
    }
  }

  const validParams = () => {
    if (nftIds.length == 0) {
      setIds("");
    }
    if (bottom == 0 || top == 0 || bottom >= top) {
      setRankBottom("");
      setRankTop("");
    }
  }

  const handleChange = (value: string, type: string) => {
    validParams();

    filters = [];
    if (value != '') {
      filters.push(`"trait_type":"${type}","value":"${value}"`);
    }
    handleFilter(type);
    refetch({ first, filters, ids:nftIds, bottom, top, sort, delay });
  };

  const handleSort = (value: string) => {
    refetch({ first, filters, ids:nftIds, bottom, top, sort: value, delay });
  }

  const handleEnter = (key: string, type: string) => {
    if (key != 'Enter') return;
    try {
      if (type == 'IDS') {
        nftIds = [];
        if (ids.includes(',')) {
          const chunks = ids.split(',');
          console.log(chunks);
          for (let chunk of chunks) {
            if (chunk.includes('-')) {
              const range = chunk.split('-');
              const bottom = parseInt(range[0]);
              const top = parseInt(range[1]);
              for (let i = bottom; i <= top; i++) {
                nftIds.push(i);
              }
            } else {
              nftIds.push(parseInt(chunk));
            }
          }
        } else {
          if (ids.includes('-')) {
            const range = ids.split('-');
            const bottom = parseInt(range[0]);
            const top = parseInt(range[1]);
            for (let i = bottom; i <= top; i++) {
              nftIds.push(i);
            }
          } else {
            if (ids != "") {
              nftIds.push(parseInt(ids));
            }
          }
        }

        refetch({ first, filters, ids:nftIds, bottom, top, sort, delay });
      }

      if (type == 'Rank Bottom' || type == 'Rank Top') {
        bottom = parseInt(rankBottom);
        top = parseInt(rankTop);

        refetch({ first, filters, ids:nftIds, bottom, top, sort, delay });
      }
    } catch (e) {
      console.log(e);
    }

    validParams();
  }

  return (
    <div>
      <Toaster />
      <Head>
        <title>Panda Warriors</title>
        <meta name="description" content="Panda Warriors is a collection of 10,000 generated NFTs, living on the Solana Blockchain, each asset is hand-drawn from scratch by a talented group of artists. Every art piece present on our website is hand-drawn by us. Each Panda Warrior is your lucky NFTicket, that will grow in value every phase of the Panda Warriors project development. Be a part of our journey full of adventures and fun." />
        <link rel="icon" href="/icon.png" />
      </Head>

      <Header />

      <section>
      {
        error ?
            <p className="text-center text-white">Error occured caused by ${error}</p>
          :
          <div className="flex flex-col md:flex-row space-y-2 md:space-x-2">

            <div className="w-full md:w-1/4 flex flex-col theme-bg-color p-5">
              <p className="text-gray-400 text-center font-bold p-3">ITEM FILTERS</p>
              <div className="h-px bg-gray-600"></div>

              <p className="text-gray-600 p-3">IDs (syntax: 1,2,5-10)</p>
              <input
                type="text"
                value={ids}
                onChange={ (e) => setIds(e.target.value.replace(" ", "")) }
                onKeyDown={ (e) => handleEnter(e.key, 'IDS') }
                className="w-full h-10 border-0 border-grey-light rounded px-2 self-center outline-none bg-gray-800 text-gray-400"
                placeholder="IDs"
              />

              <p className="text-gray-600 p-3">Skin</p>
              <select onChange={(e) => { setSkin(e.target.value); handleChange(e.target.value, 'Skin'); }} value={skin} className="w-full h-10 border-0 border-grey-light rounded px-2 self-center outline-none bg-gray-800 text-gray-400">
                <option value="" className="bg-gray-800 text-gray-400">Please select</option>
                {
                  skinS.map((data: any, idx: number) => {
                    return <option key={idx} value={data.value}>{data.value} ({data.count})</option>;
                  })
                }
              </select>

              <p className="text-gray-600 p-3">Background</p>
              <select onChange={(e) => { setBackground(e.target.value); handleChange(e.target.value, 'Background'); }} value={background} className="w-full h-10 border-0 border-grey-light rounded px-2 self-center outline-none bg-gray-800 text-gray-400">
                <option value="" className="bg-gray-800 text-gray-400">Please select</option>
                {
                  backgroundS.map((data: any, idx: number) => {
                    return <option key={idx} value={data.value}>{data.value} ({data.count})</option>;
                  })
                }
              </select>

              <p className="text-gray-600 p-3">Background Prop</p>
              <select onChange={(e) => { setBackgroundProp(e.target.value); handleChange(e.target.value, 'Background Prop'); }} value={backgroundProp} className="w-full h-10 border-0 border-grey-light rounded px-2 self-center outline-none bg-gray-800 text-gray-400">
                <option value="" className="bg-gray-800 text-gray-400">Please select</option>
                {
                  backgroundPropS.map((data: any, idx: number) => {
                    return <option key={idx} value={data.value}>{data.value} ({data.count})</option>;
                  })
                }
              </select>

              <p className="text-gray-600 p-3">Clothes</p>
              <select onChange={(e) => { setClothes(e.target.value); handleChange(e.target.value, 'Clothes'); }} value={clothes} className="w-full h-10 border-0 border-grey-light rounded px-2 self-center outline-none bg-gray-800 text-gray-400">
                <option value="" className="bg-gray-800 text-gray-400">Please select</option>
                {
                  clothesS.map((data: any, idx: number) => {
                    return <option key={idx} value={data.value}>{data.value} ({data.count})</option>;
                  })
                }
              </select>

              <p className="text-gray-600 p-3">Left Ear</p>
              <select onChange={(e) => { setLeftEar(e.target.value); handleChange(e.target.value, 'Left Ear'); }} value={leftEar} className="w-full h-10 border-0 border-grey-light rounded px-2 self-center outline-none bg-gray-800 text-gray-400">
                <option value="" className="bg-gray-800 text-gray-400">Please select</option>
                {
                  leftEarS.map((data: any, idx: number) => {
                    return <option key={idx} value={data.value}>{data.value} ({data.count})</option>;
                  })
                }
              </select>

              <p className="text-gray-600 p-3">Eyes</p>
              <select onChange={(e) => { setEyes(e.target.value); handleChange(e.target.value, 'Eyes'); }} value={eyes} className="w-full h-10 border-0 border-grey-light rounded px-2 self-center outline-none bg-gray-800 text-gray-400">
                <option value="" className="bg-gray-800 text-gray-400">Please select</option>
                {
                  eyesS.map((data: any, idx: number) => {
                    return <option key={idx} value={data.value}>{data.value} ({data.count})</option>;
                  })
                }
              </select>

              <p className="text-gray-600 p-3">Eye Socket</p>
              <select onChange={(e) => { setEyeSocket(e.target.value); handleChange(e.target.value, 'Eye Socket'); }} value={eyeSocket} className="w-full h-10 border-0 border-grey-light rounded px-2 self-center outline-none bg-gray-800 text-gray-400">
                <option value="" className="bg-gray-800 text-gray-400">Please select</option>
                {
                  eyeSocketS.map((data: any, idx: number) => {
                    return <option key={idx} value={data.value}>{data.value} ({data.count})</option>;
                  })
                }
              </select>

              <p className="text-gray-600 p-3">Mouth</p>
              <select onChange={(e) => { setMouth(e.target.value); handleChange(e.target.value, 'Mouth'); }} value={mouth} className="w-full h-10 border-0 border-grey-light rounded px-2 self-center outline-none bg-gray-800 text-gray-400">
                <option value="" className="bg-gray-800 text-gray-400">Please select</option>
                {
                  mouthS.map((data: any, idx: number) => {
                    return <option key={idx} value={data.value}>{data.value} ({data.count})</option>;
                  })
                }
              </select>

              <p className="text-gray-600 p-3">Right Ear</p>
              <select onChange={(e) => { setRightEar(e.target.value); handleChange(e.target.value, 'Right Ear'); }} value={rightEar} className="w-full h-10 border-0 border-grey-light rounded px-2 self-center outline-none bg-gray-800 text-gray-400">
                <option value="" className="bg-gray-800 text-gray-400">Please select</option>
                {
                  rightEarS.map((data: any, idx: number) => {
                    return <option key={idx} value={data.value}>{data.value} ({data.count})</option>;
                  })
                }
              </select>

              <p className="text-gray-600 p-3">Eye Accessory</p>
              <select onChange={(e) => { setEyeAccessory(e.target.value); handleChange(e.target.value, 'Eye Accessory'); }} value={eyeAccessory} className="w-full h-10 border-0 border-grey-light rounded px-2 self-center outline-none bg-gray-800 text-gray-400">
                <option value="" className="bg-gray-800 text-gray-400">Please select</option>
                {
                  eyeAccessoryS.map((data: any, idx: number) => {
                    return <option key={idx} value={data.value}>{data.value} ({data.count})</option>;
                  })
                }
              </select>

              <p className="text-gray-600 p-3">FG Prop</p>
              <select onChange={(e) => { setFgProp(e.target.value); handleChange(e.target.value, 'FG Prop'); }} value={fgProp} className="w-full h-10 border-0 border-grey-light rounded px-2 self-center outline-none bg-gray-800 text-gray-400">
                <option value="" className="bg-gray-800 text-gray-400">Please select</option>
                {
                  fgPropS.map((data: any, idx: number) => {
                    return <option key={idx} value={data.value}>{data.value} ({data.count})</option>;
                  })
                }
              </select>

              <p className="text-gray-600 p-3">Headwear</p>
              <select onChange={(e) => { setHeadwear(e.target.value); handleChange(e.target.value, 'Headwear'); }} value={headwear} className="w-full h-10 border-0 border-grey-light rounded px-2 self-center outline-none bg-gray-800 text-gray-400">
                <option value="" className="bg-gray-800 text-gray-400">Please select</option>
                {
                  headwearS.map((data: any, idx: number) => {
                    return <option key={idx} value={data.value}>{data.value} ({data.count})</option>;
                  })
                }
              </select>

              <p className="text-gray-600 p-3">Rank</p>
              <div className="w-full flex flex-row space-x-2">
                <input
                  type="number"
                  value={rankBottom}
                  onChange={ (e) => setRankBottom(e.target.value) }
                  onKeyDown={ (e) => handleEnter(e.key, 'Rank Bottom') }
                  className="w-1/2 h-10 border-0 border-grey-light rounded px-2 self-center outline-none bg-gray-800 text-gray-400"
                  placeholder="From"
                />
                <input
                  type="number"
                  value={rankTop}
                  onChange={ (e) => setRankTop(e.target.value) }
                  onKeyDown={ (e) => handleEnter(e.key, 'Rank Top') }
                  className="w-1/2 h-10 border-0 border-grey-light rounded px-2 self-center outline-none bg-gray-800 text-gray-400"
                  placeholder="To"
                />
              </div>

              <p className="text-gray-600 p-3">Sort by:</p>
              <select onChange={(e) => { setSort(e.target.value); handleSort(e.target.value); }} value={sort} className="w-full h-10 border-0 border-grey-light rounded px-2 self-center outline-none bg-gray-800 text-gray-400">
                <option value="pos-ASC" className="bg-gray-800 text-gray-400">Rank &#8593;</option>
                <option value="pos-DESC" className="bg-gray-800 text-gray-400">Rank &#8595;</option>
                <option value="id-ASC" className="bg-gray-800 text-gray-400">ID &#8593;</option>
                <option value="id-DESC" className="bg-gray-800 text-gray-400">ID &#8595;</option>
              </select>
            </div>

            <div className="w-full md:w-3/4 flex flex-col">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 m-2">
                {
                  data?.getItems.edges.map((edge: any) => {
                    return (
                      <NftCard 
                        key={edge.node.hash}
                        name={edge.node.name}
                        score={edge.node.score}
                        pos={edge.node.pos}
                        image={edge.node.image}
                        detail={edge.node}
                        handleShowDetail={handleShowDetail}
                      />
                    );
                  })
                }
              </div>
              {
                hasNextPage && (
                  <button
                    className={`bg-transparent ${loading ? "hover:bg-transparent" : "hover:bg-blue-900 border border-blue-900"} text-blue-900 hover:text-gray-400 py-2 px-4 hover:border-transparent rounded flex inline-block justify-center items-center m-2`}
                    disabled={isRefetching}
                    onClick={() =>
                      fetchMore({
                        variables: {
                          first,
                          after: data.getItems.pageInfo.endCursor,
                        },
                      })
                    }
                  >
                    { 
                      loading ?
                        <div
                          className="
                            animate-spin
                            rounded-full
                            h-8
                            w-8
                            border-t-2 border-b-2 border-blue-900
                          "
                        ></div>
                      :
                        "Load more"
                    }
                  </button>
                )
              }
            </div>

          </div>
      }
      </section>

      <Transition.Root show={visibleDetailModal} as={Fragment}>
        <Dialog as="div" className="fixed z-10 inset-0 overflow-y-auto" initialFocus={cancelButtonRef} onClose={setVisibleDetailModal}>
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
                      <Dialog.Title as="h3" className="text-lg leading-6 font-bold text-gray-900">
                        {nftDetail?.name}
                      </Dialog.Title>

                      <div className="mt-5 w-full flex flex-col space-y-2">

                        <div className="w-full flex flex-col md:flex-row space-y-2">
                          <div className="w-full md:w-1/3 rounded-lg overflow-hidden">
                            <a href={nftDetail?.image} target="_blank">
                              <img src={nftDetail?.image} />
                            </a>
                          </div>
                          <div className="w-full md:w-2/3 flex flex-col space-y-2">
                            <p className="font-bold text-center text-gray-900">PROPERTIES</p>
                            <div className="w-full flex flex-row justify-center items-center">
                              <div className="w-1/3 flex flex-col justify-center items-center">
                                <p className='text-center text-gray-400'>RANK</p>
                                <p className='text-center font-bold text-gray-700'>{nftDetail?.pos}</p>
                              </div>
                              <div className="w-px bg-gray-400"></div>
                              <div className="w-1/3 flex flex-col justify-center items-center">
                                <p className='text-center text-gray-400'>SCORE</p>
                                <p className='text-center font-bold text-gray-700'>{nftDetail?.score}</p>
                              </div>
                              <div className="w-px bg-gray-400"></div>
                              <div className="w-1/3 flex flex-col justify-center items-center">
                                <p className='text-center text-gray-400'>TRAITS</p>
                                <p className='text-center font-bold text-gray-700'>{nftDetail?.traits.length}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <p className="font-bold text-center text-gray-900">ATTRIBUTES</p>
                        <div className="w-full grid grid-cols-4 gap-1">
                          {
                            nftDetail?.traits.map((trait: any, index: number) => {
                              return (
                                <div key={index} className="col-span-1 bg-blue-500 hover:bg-blue-400 rounded-lg overflow-hidden flex flex-col justify-center items-center space-y-1 p-1 cursor-pointer">
                                  <p className="text-center text-gray-600 text-xs">{trait.trait_type}</p>
                                  <p className="text-center text-blue-200 font-bold text-sm">{trait.value}</p>
                                  <p className="text-center text-gray-600 text-xs">({trait.percent}%)</p>
                                </div>
                              )
                            })
                          }
                        </div>

                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => setVisibleDetailModal(false)}
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
    </div>
  );
};

export default Rarity;



