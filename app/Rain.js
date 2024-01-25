import React, { useEffect, useState } from 'react';
import OpenAI from 'openai';
import generateIdea from './generateIdea';

const Rain = () => {
  const [drops, setDrops] = useState([]);
  const [prompt, setPrompt] = useState('');
  const [selectedDrops, setSelectedDrops] = useState([]);

  let openai;

  const handleDropClick = (content) => {
    setSelectedDrops(currentSelected => [content, ...currentSelected]);
  };


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

    const handleAnimationEnd = (key) => {
      setDrops(currentDrops => currentDrops.filter(drop => drop.key !== key));
    };

    const createDrop = async () => {
      const leftPosition = Math.random() * (window.innerWidth - 400);
      const size = Math.random() * 10 + 10;
      const content = await generateIdea(prompt, openai);
      const animationDuration = 15 - size / 2;
      const dropKey = uniqueKey();
      const newDrop = {
        content,
        key: dropKey,
        style: {
          left: `${leftPosition}px`,
          position: 'absolute',
          maxWidth: '400px',
          overflowWrap: 'break-word',
          fontSize: `${size}px`,
          animation: `fall ${animationDuration}s linear`,
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          // align vertical to center
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: '50px',
        },
        onEnd: () => handleAnimationEnd(dropKey)
      };
      setDrops(currentDrops => [...currentDrops, newDrop]);
    };

    const createInterval = setInterval(createDrop, 500);
    return () => clearInterval(createInterval);
  }, [prompt, openai]);

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ flexGrow: 1, position: 'relative', overflow: 'hidden' }}>
        {drops.map(drop => (
          <div key={drop.key} style={drop.style} onAnimationEnd={drop.onEnd} onClick={() => handleDropClick(drop.content)}>
            {drop.content}
          </div>
        ))}
        <form style={{ position: 'absolute', top: 0, width: '100%', padding: '10px', backgroundColor: '#f0f0f0' }}>
          <textarea
            placeholder="お題を入力してください。出力の様子を見ながら、文字数や方向性の指示を追加してみてください。 Enter your prompt here. Add instructions for length and content as you observe the output."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            style={{ width: 'calc(100% - 50px)', height: '50px', fontSize: '16px' }}
          />
        </form>
      </div>
      <div style={{ width: '200px', backgroundColor: '#f9f9f9', overflowY: 'auto', padding: '10px', boxSizing: 'border-box' }}>
        {selectedDrops.length > 0 ? selectedDrops.map((content, index) => (
          <div key={index} style={{ marginBottom: '10px', fontSize: '12px', maxHeight: '100px', overflowY: 'auto' }}>{content}</div>
        )) : <div style={{ fontSize: '14px' }}>降っていることばをクリックして保存. Click the falling words to save them.</div>}
      </div>
    </div>
  );
};

const uniqueKey = () => {
  return Math.random().toString(36).substr(2, 9);
};

export default Rain;
