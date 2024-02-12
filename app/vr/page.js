"use client";

import { useState, useEffect, useRef } from "react";
import { Canvas, useFrame } from '@react-three/fiber';
import { Text } from "@react-three/drei";
import { VRButton, XR } from "@react-three/xr";
import OpenAI from 'openai';
import generateIdea from '../generateIdea';
import uniqueKey from "../uniqueKey";
import styles from "./vr.module.css";

const Texts = ({drops, setDrops}) => {
  const PROGRESS_PER_FRAME = 0.001
  const MAX_HEIGHT = 5
  const MIN_HEIGHT = -3
  const MAX_RADIUS = 5
  const MIN_RADIUS = 3

  useFrame(() => {
    if (drops.length <= 0) return;
    setDrops(currentDrops => currentDrops.map(drop => {
      return {...drop, progress: drop.progress + PROGRESS_PER_FRAME}
    }).filter(drop => drop.progress <= 1))
  });

  return <>
    { prompt == '' && 
      <Text
        font="/fonts/noto_jp_medium.ttf"
        fontSize={0.03}
        color="#999999"
        maxWidth={10}
        overflowWrap='break-word'
        lineHeight={1.7}
        textAlign="center"
        anchorX="center"
        anchorY="middle"
        position={[0, 1, -1]} // 視界の中央に配置
      >
        テキストを入力...
      </Text>
    } 
    { prompt != '' &&
      <Text
        font="/fonts/noto_jp_medium.ttf"
        fontSize={0.03}
        color="#000000"
        maxWidth={10}
        overflowWrap='break-word'
        lineHeight={1.7}
        textAlign="center"
        anchorX="center"
        anchorY="middle"
        position={[0, 1, -1]} // 視界の中央に配置
      >
        {prompt}
      </Text>
    }

    {drops.map(drop => {
      const theta = drop.theta * Math.PI * 2 / 3 - Math.PI / 3
      const height = MAX_HEIGHT - drop.progress * (MAX_HEIGHT - MIN_HEIGHT)
      const r = MIN_RADIUS + drop.r * (MAX_RADIUS - MIN_RADIUS)
      return <Text
        key={drop.key}
        font="/fonts/noto_jp_medium.ttf"
        fontSize={0.1}
        lineHeight={1.6}
        color="#000000"
        fillOpacity={1 - drop.r}
        maxWidth={3.5}
        overflowWrap='break-word'
        position={[
          -r * Math.sin(theta),
          height,
          -r * Math.cos(theta)
        ]}
        rotation={[0, theta, 0]}
      >
        {drop.content}
      </Text>
    })}
  </>
}

const VRPage = () => {
  const DEFAULT_PROMPT = '新しいAR向けアプリのアイデアを30文字以内の日本語で1つ考えてください。'
  const textField = useRef()
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT)
  const [drops, setDrops] = useState([])
  let openai

  useEffect(() => {
    const getQueryParam = (param) => {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get(param);
    };
    const OPENAI_API_KEY = getQueryParam('key');
    if (OPENAI_API_KEY) {
      openai = new OpenAI({
        apiKey: OPENAI_API_KEY,
        dangerouslyAllowBrowser: true
      });
    } else {
      console.error('No API key provided.');
    }

    const createDrop = async () => {
      const newDrop = {
        content: await generateIdea(prompt, openai),
        // content: "新しいAR向けアプリのアイデアを30文字以内の日本語で1つ考えてください。",
        key: uniqueKey(),
        progress: 0, // progress: 0~1
        theta: Math.random(), // x: 0~1
        r: Math.random() // r: 0~1
      }
      setDrops(currentDrops => [...currentDrops, newDrop])
    }
    const createInterval = setInterval(createDrop, 500);
    return () => clearInterval(createInterval);
  }, [prompt, openai])
  
  return (
    <main className={styles.container}>
      <div className={styles.vrButton}><VRButton></VRButton></div>
      <div className={styles.controls}>
        {/* <a href='https://emmanuellee.com/webxr-samples/system-keyboard.html'>Resource: keyboard sample</a> */}
        <input type="text" ref={textField} value={prompt} onChange={(e) => setPrompt(e.target.value)} />
        {prompt == '' &&
          <button onClick={() => setPrompt(DEFAULT_PROMPT)}>Restore default prompt</button>
        }
        {prompt != '' &&
          <button onClick={() => setPrompt('')}>Clear prompt</button>
        }
      </div>
      <Canvas style={styles.canvas} onCreated={({ gl }) => {
        gl.setClearColor('#f0f0f0');
      }}>
        <XR
          onSessionStart={(e) => { textField.current.focus() }}
          onSessionEnd={(e) => {}}
          >
          <ambientLight intensity={0.5}></ambientLight>
          <pointLight position={[3, 3, 3]}></pointLight>
          <directionalLight position={[-2, 3, 5]}/>
          <Texts drops={drops} setDrops={setDrops}/>
        </XR>
      </Canvas>
    </main>
  );
};

export default VRPage;