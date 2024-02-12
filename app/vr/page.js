"use client";

import { useState, useEffect, useRef } from "react";
import { Canvas, useFrame } from '@react-three/fiber';
import { Text } from "@react-three/drei";
import { VRButton, XR } from "@react-three/xr";
import generateIdea from '../generateIdea';
import uniqueKey from "../uniqueKey";
import styles from "./vr.module.css";

const Texts = ({drops, setDrops}) => {
  const PROGRESS_PER_FRAME = 0.0015
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
      const theta = drop.theta * Math.PI - Math.PI / 2
      const height = MAX_HEIGHT - drop.progress * (MAX_HEIGHT - MIN_HEIGHT)
      const r = MIN_RADIUS + drop.r * (MAX_RADIUS - MIN_RADIUS)
      return <Text
        key={drop.key}
        font="/fonts/noto_jp_medium.ttf"
        fontSize={0.2}
        color="#000000"
        fillOpacity={1 - drop.r * 0.6}
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
  const textField = useRef()
  const [prompt, setPrompt] = useState('新しいAR向けアプリのアイデアを30文字以内の日本語で1つ考えてください。')
  const [drops, setDrops] = useState([])

  useEffect(() => {
    const createDrop = async () => {
      const newDrop = {
        content: "Sample content here",
        key: uniqueKey(),
        progress: 0, // progress: 0~1
        theta: Math.random(), // x: 0~1
        r: Math.random() // r: 0~1
      }
      setDrops(currentDrops => [...currentDrops, newDrop])
    }
    const createInterval = setInterval(createDrop, 1000);
    return () => clearInterval(createInterval);
  }, [prompt])
  
  return (
    <main className={styles.container}>
      <div className={styles.vrButton}><VRButton></VRButton></div>
      <a href='https://emmanuellee.com/webxr-samples/system-keyboard.html'>Resource link</a>
      <input type="text" ref={textField} value={prompt} onChange={(e) => setPrompt(e.target.value)} />
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