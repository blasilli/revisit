import React, { useEffect, useState, useRef } from 'react';
import { useChartDimensions } from './useChartDimensions';
import * as d3 from 'd3';


function formatTweetDate(isoString) {
  const date = new Date(isoString);

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}


const chartSettings = {
  marginBottom: 40,
  marginLeft: 40,
  marginTop: 15,
  marginRight: 15,
  width: 400,
  height: 400,
};

function Tweet({ parameters }) {
  const [ref] = useChartDimensions(chartSettings);

  const {
    tweetId
  } = parameters;

  const imgUrl = `/TrueVisLies/assets/twitter/images/${tweetId}.png`;
  const dataUrl = `/TrueVisLies/assets/twitter/data/${tweetId}.json`;

  // ---- Tweet data ----
  const [tweet, setTweet] = useState(null);

  // ---- Resizable width (fonts stay fixed) ----
  const [cardWidth, setCardWidth] = useState(550);
  const [isResizing, setIsResizing] = useState(false);
  const resizeStateRef = useRef({
    startY: 0,
    startWidth: 550,
  });

  // Load tweet data (JSON)
    useEffect(() => {
      d3.json(dataUrl)
        .then((data) => {
          setTweet(data);
        })
        .catch(() => {
          setTweet(null);
        });
    }, [tweetId]);


  // Scroll page to top whenever the tweet changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth', // or 'auto'
      });
    }
  }, [tweetId]);

  // Resize logic (bottom-center drag → width change)
  useEffect(() => {
    if (!isResizing) return;

    function onMouseMove(e) {
      const deltaY = e.clientY - resizeStateRef.current.startY;

      // vertical drag controls width
      let newWidth = resizeStateRef.current.startWidth + deltaY * 2;

      const viewport = window.innerWidth || 1200;
      const maxWidth = Math.min(viewport - 80, 1500); // keep margins and a hard max
      const minWidth = 400;

      newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
      setCardWidth(newWidth);
    }

    function onMouseUp() {
      setIsResizing(false);
    }

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isResizing]);

  const handleResizeMouseDown = (e) => {
    e.preventDefault();
    resizeStateRef.current = {
      startY: e.clientY,
      startWidth: cardWidth,
    };
    setIsResizing(true);
  };

  return (
    <div
      ref={ref}
      style={{
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        paddingTop: 40,
        paddingBottom: 40,
        background: '#f5f8fa',
        overflowX: 'hidden',
        fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
      }}
    >
      <div
        style={{
          width: cardWidth,
          background: 'white',
          borderRadius: 16,
          border: '1px solid #e1e8ed',
          boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
          padding: '12px 16px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          position: 'relative',
          boxSizing: 'border-box',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 15,
          }}
        >
          <span style={{ fontWeight: 700, color: '#0f1419' }}>{' 👤 ' + (tweet ? tweet.author : 'John Doe')}</span>
          <span style={{ color: '#536471' }}>· {tweet ? formatTweetDate(tweet.date) : null}</span>
        </div>

        {/* Tweet text */}
        <div
          style={{
            marginTop: 4,
            marginBottom: 4,
            fontSize: 18,
            lineHeight: 1.5,
            color: '#0f1419',
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
          }}
        >
          {tweet ? tweet.text : '...'}
        </div>

        {/* Tweet image – NO maxHeight so the card can grow/shrink */}
        <div
          style={{
            borderRadius: 16,
            overflow: 'hidden',
            border: '1px solid #cfd9de',
            marginTop: 15,
          }}
        >
          <img
            src={imgUrl}
            alt="Tweet media"
            style={{
              display: 'block',
              width: '100%',
              height: 'auto',
            }}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>

        {/* Identifier of the tweet */}
        <div
          style={{
            marginTop: 8,
            fontSize: 10,
            fontFamily: 'monospace',
            color: '#536471',
            textAlign: 'center',
          }}
        >
          Tweet ID: {tweetId}
        </div>

        {/* Bottom-center resize handle */}
        <div
          onMouseDown={handleResizeMouseDown}
          style={{
            position: 'absolute',
            bottom: 6,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 100,
            height: 8,
            borderRadius: 999,
            border: '1px solid #cfd9de',
            background: '#f5f8fa',
            cursor: 'ns-resize',
            boxShadow: '0 1px 2px rgba(0,0,0,0.12)',
          }}
          title="Drag up/down to resize"
        />
      </div>
    </div>
  );
}

export default Tweet;