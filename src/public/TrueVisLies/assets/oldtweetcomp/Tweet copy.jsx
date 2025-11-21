import React, { useEffect, useState } from 'react';
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
    avatarUrl = 'TrueVisLies/assets/twitter/avatar.png', // adjust to your real avatar path
  } = parameters;

  const imgUrl = `/TrueVisLies/assets/twitter/images/${tweetId}.png`;
  const textUrl = `/TrueVisLies/assets/twitter/texts/${tweetId}.txt`;

  const [tweetText, setTweetText] = useState('Loading tweet…');


  // Load tweet text from local .txt
  useEffect(() => {
    let cancelled = false;

    fetch(textUrl)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to load tweet text from ${textUrl}`);
        }
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

  return (
    <div
      className="Chart__wrapper"
      ref={ref}
      style={{
        width: 800,
        height: 400,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f5f8fa',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <div
        style={{
          width: 550,
          background: 'white',
          borderRadius: 16,
          border: '1px solid #e1e8ed',
          boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
          padding: '12px 16px',
          display: 'flex',
          gap: 12,
        }}
      >
        {/* Avatar */}
        <div style={{ flexShrink: 0 }}>
          <img
            src={avatarUrl}
            alt={`${name} avatar`}
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              objectFit: 'cover',
            }}
          />
        </div>

        {/* Main content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Header: name, handle, timestamp */}
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
              marginBottom: 8,
              fontSize: 15,
              lineHeight: 1.4,
              color: '#0f1419',
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word',
            }}
          >
            { tweetText}
          </div>

          {/* Tweet image (optional) */}
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
                // hide image if not found
                (e.currentTarget).style.display = 'none';
              }}
            />
          </div>

          {/* Actions row */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: 8,
              maxWidth: 380,
              fontSize: 13,
              color: '#536471',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span>💬</span>
              <span>12</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span>🔁</span>
              <span>34</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span>❤️</span>
              <span>89</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span>📊</span>
              <span>1.2K</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Tweet;