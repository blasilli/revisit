import React, { useEffect, useState, useRef } from 'react';
import { useChartDimensions } from './useChartDimensions';
import * as d3 from 'd3';



const errorDescriptions = {
  'Truncated axis': 'A truncated axis does not start at zero. This can occur in both horizontal and vertical axes.',
  'Dual axis':  'A dual axis is when there is more than 1 (vertical, typically) axis on the same chart (does not include 2 charts side-by-side).',
  'Value as area/volume': 'Value as area/volume is when a numeric value is encoded as area (e.g., circles) or volume (e.g., cubes).',
  'Inverted axis': 'Inverted axis is when the axis directions are opposite to what one would expect (e.g., cases increasing = down). This can occur in both horizontal and vertical axes.',
  'Uneven binning': 'Uneven binning is when a chart’s bins are arbitrarily defined or have uneven bin sizes',
  'Unclear encoding': 'Unclear encoding is when it is not possible to completely understand what is shown in a given chart due to issues such as poor image quality, overcomplicated representation, or simply not enough information to understand the chart, because of issues such as the legend being cut off.',
  'Inappropriate encoding': 'Inappropriate encoding is when the chart’s type (line chart, pie chart, etc.) is clearly not appropriate given the underlying data. For instance, showing a value change year-to-year with a stacked bar chart, as opposed to a simple or clustered one. Or a change in a value is plotted in a case where you would expect the absolute value instead.',
  'Cherry-picking': 'Cherry-picking is when the main conclusion of a chart and its accompanying text (title, annotation, caption) is consistent with the incomplete evidence presented but likely would not be generalizable with more representative evidence.',
  'Setting an arbitrary threshold': 'Setting an arbitrary threshold is when a chart’s accompanying text (title, annotation, caption) uses an arbitrary (i.e., not present in visualized data, not known, not justified) threshold to make judgments, inferences, and derive insights from the visualization. The threshold can be stated explicitly as a number or added as an annotation in a chart.',
  'Causal inference': 'Causal inference is when a chart’s accompanying text (title, annotation, caption) suggests a cause-and-effect relationship in an attempt to explain certain salient features of the chart and evaluate them. Causal relationships are typically evaluated either by themselves against an arbitrary (e.g., message author-defined) satisfactory threshold or against another inferred causal relationship. Causality inferred from a visualization can be especially misleading in cases when the data are cherry-picked.',
  'Issues with data validity': 'A message has issues with data validity when the message’s chart doesn’t include explicit information about caveats related to data accuracy and data interpretation, or the message’s text doesn’t reflect existing caveats in their interpretation of the visualization.',
  'Failure to account for statistical nuance': 'Failure to account for statistical nuance occurs when a message’s chart or text makes a conclusion using inferences drawn without considering statistical nuances, such as the base rate fallacy.',
  'Misrepresentation of scientific studies': 'Misrepresentation of scientific studies occurs when a chart’s accompanying text (title, annotation, caption) relies upon pseudoscience to come to a conclusion.',
  'Incorrect reading of chart': 'Incorrect reading of a chart is when a message’s author cites a chart as evidence to a conclusion, but the author fails to correctly read the data presented by said chart.'
};

function getErrorDescription(errorType) {
  return errorDescriptions[errorType] || '...';
}

const rhetorics = {
  'Information Access Rhetoric': 'Refers to choices about what data to include, omit, filter, or aggregate. These choices shape what the viewer sees and which patterns or narratives are emphasized.',
  'Provenance Rhetoric': 'Relates to how a visualization communicates trustworthiness, such as by citing sources, explaining methods, noting uncertainty, or including methodology or assumptions.',
  'Mapping Rhetoric': 'Involves how data values are translated into visual features such as position, size, scale, metaphor, or color. This can create emphasis or shape perception beyond what the raw data conveys.',
  'Linguistic-Based Rhetoric': 'Uses language elements like titles, labels, annotations, or captions to guide interpretation. Often includes metaphor, irony, rhetorical questions, or other narrative framing.',
  'Procedural Rhetoric': 'Relates to interaction and navigation design, such as default views, filters, or animations. These features guide how users explore the data and can influence which conclusions they reach.'
};

const purposes = {
  'Aesthetic-Driven Misrepresentation':
'The author prioritizes the visual appeal of the visualizations, giving them precedence over accuracy. These stylistic preferences, such as decorative choices, lead to misinterpretation, despite the author\'s intention not to mislead.',

'Bias Exploitation':
'The visualization is crafted to take advantage of known human visual perceptual or cognitive biases in order to push the reader to a particular interpretation. ',

  'Claim-Supporting Manipulation':
'The author shapes the visualization and its caption to highlight a desired pattern or hide counter-evidence. The goal is to persuade the reader to adopt a particular perspective, for example, by spreading disinformation about COVID-19.',

'Context Distortion':
'The author removes (or hides/omits) relevant context that is essential for accurate interpretation of the visualization (missing labels, explanations, legends). The goal is to persuade the reader towards a particular perspective.',

'Deliberate Reader Confusion':
'The author introduces unnecessary complexity, such as ambiguous encodings, to create confusion and make the reader more receptive to the author\'s narrative.',

'Lack of Visualization Literacy':
'The author is unfamiliar with best practices in visualization and inadvertently introduces misleading elements. For example, the author may choose inappropriate chart types or a design that inadvertently leads to misleading conclusions.',

'Selective Reporting':
'The author reports only partial information, such as, reporting partial data, focusing/highlighting on a data subset. The goal is to provide a skewed representation of the information, aiming at persuading the reader towards a particular perspective.',

'Space and Format Constraints':
'Constraints (such as, space constraints, image size/format) limit the design or presentation of the visualization. The author, to cope with these constraints, may incur information loss, which can lead to misrepresentation.',

'Unintentional Context Omission':
'Accidental omissions of relevant context that are essential for accurate interpretation of the visualization (missing labels, explanations, legends). The misleading purpose is not deliberate.'
};




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
    tweetId,
    error
  } = parameters;

  const imgUrl = `../study/assets/twitter/images/${tweetId}.png`;
  const dataUrl = `../study/assets/twitter/data/${tweetId}.json`;
  const docUrl = `../study/assets/TrueVisLiesStudyDoc.pdf`;

  // ---- Tweet data ----
  const [tweet, setTweet] = useState(null);

  // ---- Resizable width (fonts stay fixed) ----
  const [cardWidth, setCardWidth] = useState(550);
  const [isResizing, setIsResizing] = useState(false);
  const resizeStateRef = useRef({
    startY: 0,
    startWidth: 550,
  });

  // ---- Collapsible sections (start collapsed) ----
  const [showRhetoric, setShowRhetoric] = useState(false);
  const [showPurposes, setShowPurposes] = useState(false);

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

  // Scroll page to top + collapse sections whenever the tweet changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth',
      });
    }
    // open both panels on tweet change
    //setShowRhetoric(true);
    //setShowPurposes(true);

    // set background
    d3.select('.main').style('background-color', '#f5f7fa');
  }, [tweetId]);

  // Resize logic (bottom-center drag → width change)
  useEffect(() => {
    if (!isResizing) return;

    function onMouseMove(e) {
      const deltaY = e.clientY - resizeStateRef.current.startY;

      let newWidth = resizeStateRef.current.startWidth + deltaY * 2;

      const viewport = window.innerWidth || 1200;
      const maxWidth = Math.min(viewport - 80, 1500);
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
    <div ref={ref}>
      <div 
        className='info'
        style={{
          background: '#ffffff',
          padding: '20px 30px',
          borderRadius: 8,
          border: '1px solid #e1e8ed',
          boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
        }}
      >
        <p
          style={{
            textAlign: 'center',
            marginTop: 0,
            marginBottom: 0,
            paddingBottom: 0,
          }}
        >
          <span>
            This is a tweet that contains <b>misleading visualization(s)</b> affected by the following error:&nbsp;
          </span>
          <span
            style={{
              fontWeight: 700,
              color: '#ae2105',
            }}
          >
            {error ? error : '...'}
          </span>
        </p>
        <p
          style={{
            textAlign: 'center',
            fontStyle: 'italic',
            fontSize: '0.9em',
            color: '#51565aff',
            marginTop: 4,
            paddingTop: 0,
            marginBottom: 4,
          }}
        >
          {error ? getErrorDescription(error) : '...'}
        </p>
      </div>

      <div
        className='tweet'
        style={{
          width: '100%',
          minHeight: '50vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          paddingTop: 40,
          paddingBottom: 40,
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
            <span style={{ fontWeight: 700, color: '#0f1419' }}>
              {' 👤 ' + (tweet ? tweet.author : 'John Doe')}
            </span>
            <span style={{ color: '#536471' }}>
              · {tweet ? formatTweetDate(tweet.date) : null}
            </span>
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

          {/* Tweet image */}
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

      {/* Hint move up/down the handle */}
      <div
        style={{
          textAlign: 'center',
          fontSize: '0.8em',
          color: '#888888',
          marginTop: -30,
          marginBottom: 20,
        }}
      >
        Drag up/down the handle above to resize the image
      </div>

      

      {/* Purposes overview (collapsible) */}
      <div
        className='purposesOverview'
        style={{
          fontSize: '0.9em',
          background: '#ffffff',
          padding: '20px 30px',
          borderRadius: 8,
          border: '1px solid #e1e8ed',
          boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
          marginTop: 20,
          marginBottom: 40,
        }}
      >
        <div
          onClick={() => setShowPurposes((v) => !v)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            marginBottom: showPurposes ? 12 : 0,
          }}
        >
          <span style={{ fontWeight: 600 }}>Author Intent and Factors Behind the Misleading Effect</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, lineHeight: '35px'}}>
            <span style={{ fontSize: '0.8em', color: '#51565aff' }}>{showPurposes ? '[COLLAPSE]' : '[EXPAND]'}</span>
            <span style={{ fontSize: 30 }}>{showPurposes ? '▾' : '▸'}</span>
          </div>
        </div>

        {showPurposes && (
          <ul
            style={{
              fontSize: '0.9em',
              paddingLeft: 20,
              marginTop: 0,
            }}
          >
            {Object.entries(purposes).map(([purpose, description]) => (
              <li key={purpose} style={{paddingBottom: '6px'}}>
                <b>{purpose}</b>:&nbsp;
                <span>{description}</span>
              </li>
            ))}
          </ul>
        )}
        { /* Link for open documentation in external tab */}
        {showPurposes && ( <p>
          To see these descriptions in a separate tab, open the &nbsp;
          <a 
            href={docUrl} 
            target='_blank' 
            rel='noopener noreferrer'
            style={{ color: '#1da1f2', textDecoration: 'none' }}
          >
            documentation
          </a>.
        </p>)}
      </div>
    </div>
  );
}

export default Tweet;
