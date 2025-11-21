import React, { useEffect, useState, useRef } from 'react';
import { useChartDimensions } from '../useChartDimensions';

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
    tweetId,
    name = 'Jane Doe',
    handle = '@janedoe',
    timestamp = '2h',
  } = parameters;

  const imgUrl = `/TrueVisLies/assets/twitter/images/${tweetId}.png`;
  const textUrl = `/TrueVisLies/assets/twitter/texts/${tweetId}.txt`;

  const [tweetText, setTweetText] = useState('Loading tweet…');

  // --- Resizable card state ---
  const [cardWidth, setCardWidth] = useState(550);
  const [isResizing, setIsResizing] = useState(false);
  const resizeStateRef = useRef({
    startX: 0,
    startWidth: 550,
  });

  // Load tweet text
  useEffect(() => {
    let cancelled = false;

    fetch(textUrl)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load tweet text');
        return res.text();
      })
      .then((text) => {
        if (!cancelled) setTweetText(text);
      })
      .catch(() => {
        if (!cancelled) setTweetText('(Could not load tweet text)');
      });

    return () => {
      cancelled = true;
    };
  }, [textUrl]);

  // Handle mouse move / up for resizing
  useEffect(() => {
    if (!isResizing) return;

    function onMouseMove(e) {
      const deltaX = e.clientX - resizeStateRef.current.startX;
      let newWidth = resizeStateRef.current.startWidth + deltaX;

      // clamp the width
      newWidth = Math.max(320, Math.min(900, newWidth));
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
    e.preventDefault(); // avoid text selection
    resizeStateRef.current = {
      startX: e.clientX,
      startWidth: cardWidth,
    };
    setIsResizing(true);
  };

  return (
    <div
      className="Chart__wrapper"
      ref={ref}
      style={{
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: 40,
        background: '#f5f8fa',
        fontFamily:
          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <div
        style={{
          width: cardWidth,
          background: 'white',
          borderRadius: 16,
          border: '1px solid #e1e8ed',
          boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
          padding: '12px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          position: 'relative', // needed for the resize handle
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
          <span style={{ fontWeight: 700, color: '#0f1419' }}>{name}</span>
          <span style={{ color: '#536471' }}>{handle}</span>
          <span style={{ color: '#536471' }}>· {timestamp}</span>
        </div>

        {/* Tweet text */}
        <div
          style={{
            marginTop: 4,
            marginBottom: 4,
            fontSize: 15,
            lineHeight: 1.4,
            color: '#0f1419',
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
          }}
        >
          {tweetText}
        </div>

        {/* Tweet image */}
        <div
          style={{
            borderRadius: 16,
            overflow: 'hidden',
            border: '1px solid #cfd9de',
            marginTop: 4,
            maxHeight: 280,
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

        {/* Resize handle (bottom-right corner) */}
        <div
          onMouseDown={handleResizeMouseDown}
          style={{
            position: 'absolute',
            right: 6,
            bottom: 6,
            width: 14,
            height: 14,
            borderRadius: 4,
            border: '1px solid #cfd9de',
            background: '#f5f8fa',
            cursor: 'se-resize',
            boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
          }}
          title="Drag to resize"
        />
      </div>
    </div>
  );
}

export default Tweet;