"use client";

import { useState, useRef } from "react";
import { Canvas } from '@react-three/fiber';
import { Sphere, Box, Cylinder, Text } from "@react-three/drei";
import { VRButton, XR, useXR } from "@react-three/xr";
import styles from "./vr.module.css";

const VRPage = () => {
  const [text, setText] = useState('新しいAR向けアプリのアイデアを30文字以内の日本語で1つ考えてください。'); // テキストの状態  
  const textField = useRef()

  return (
    <main className={styles.container}>
      <div className={styles.vrButton}><VRButton></VRButton></div>
      <a href='https://emmanuellee.com/webxr-samples/system-keyboard.html'>Resource link</a>
      <input type="text" ref={textField} value={text} onChange={(e) => setText(e.target.value)} />
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

          { text == '' && 
            <Text
              font="/fonts/noto_jp_medium.ttf"
              fontSize={0.3}
              color="#999999"
              maxWidth={10}
              overflowWrap='break-word'
              lineHeight={1.7}
              textAlign="center"
              anchorX="center"
              anchorY="middle"
              position={[0, 1, -5]} // 視界の中央に配置
            >
              テキストを入力...
            </Text>
          } 
          { text != '' &&
            <Text
              font="/fonts/noto_jp_medium.ttf"
              fontSize={0.3}
              color="#000000"
              maxWidth={10}
              overflowWrap='break-word'
              lineHeight={1.7}
              textAlign="center"
              anchorX="center"
              anchorY="middle"
              position={[0, 1, -5]} // 視界の中央に配置
            >
              {text}
            </Text>
          }
        </XR>
      </Canvas>
    </main>
  );
};

export default VRPage;