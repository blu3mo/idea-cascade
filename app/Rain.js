"use client";

import React, { useEffect, useState } from 'react';
import OpenAI from 'openai';
import generateIdea from './generateIdea';

const Rain = () => {
  const [drops, setDrops] = useState([]);
  const [prompt, setPrompt] = useState('');

  let openai;

  useEffect(() => {
    const updateDrops = () => {
      setDrops(currentDrops => currentDrops.map(drop => {
        const fontSize = parseFloat(drop.style.fontSize);
        return {
        ...drop,
        style: { ...drop.style, top: `${drop.top += fontSize / 20}px` },
      }}).filter(drop => drop.top < window.innerHeight));
      requestAnimationFrame(updateDrops);
    };

    updateDrops();
  }, []);

  useEffect(() => {
    const getQueryParam = (param) => {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get(param);
    };
  
    // Extracting the API key from the URL
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
      const leftPosition = Math.random() * (window.innerWidth - 400);
      const size = Math.random() * 10 + 10;
      const content = await generateIdea(prompt, openai);
      const newDrop = {
        content,
        key: uniqueKey(),
        top: 0,
        style: {
          left: `${leftPosition}px`,
          position: 'absolute',
          maxWidth: '400px', 
          overflowWrap: 'break-word',
          fontSize: `${size}px`,
        }
      };
      setDrops(currentDrops => [...currentDrops, newDrop]);
    };

    const createInterval = setInterval(createDrop, 200);//200);

    return () => clearInterval(createInterval);
  }, [prompt, openai]);

  return (
    <div style={{ position: 'relative', overflow: 'hidden', height: '100vh' }}>
      {drops.map(drop => (
        <div key={drop.key} style={drop.style}>
          {drop.content}
        </div>
      ))}
      <form style={{ position: 'absolute', top: 0, width: '100%', padding: '10px', backgroundColor: '#f0f0f0' }}>
        <textarea
          placeholder="お題を入力してください。出力を見ながら、文字数や方向性を指定してみてください。"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          style={{ marginRight: '10px', width: '500px', height: '50px' }}
        />
      </form>
    </div>
  );
};

// const generateRandomString = () => {
//   return new Promise(resolve => {
//     setTimeout(() => {
//       const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
//       let randomString = '';
//       for(let i = 0; i < 100; i++) {
//         randomString += characters.charAt(Math.floor(Math.random() * characters.length));
//       }
//       resolve(randomString);
//     }, 50); // Simulating async operation delay
//   });
// };
//
// const uniqueKey = () => {
//   return Math.random().toString(36).substr(2, 9);
// };

export default Rain;
