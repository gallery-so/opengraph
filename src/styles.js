export const containerStyle = {
  display: 'flex',
  flexDirection: 'row',
  width: '100%',
  height: '100%',
  minHeight: 200,
  backgroundColor: '#ffffff',
  justifyContent: 'space-between',
  alignItems: 'center',
};

export const blurredLeftSideImageStyle = {
  display: 'flex',
  position: 'relative',
  marginLeft: '-25%',
  filter: 'blur(6px)',
  opacity: 0.26,
};

export const centeredImageContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  position: 'absolute',
  width: '100%',
  height: '100%',
};

export const blurredRightSideImageStyle = {
  display: 'flex',
  position: 'relative',
  marginRight: '-25%',
  filter: 'blur(6px)',
  opacity: 0.26,
};

export const imageDescriptionStyle = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  filter: 'blur(2px)',
};

export const textStyle = {
  fontFamily: "'ABCDiatype-Regular'",
  fontSize: '14px',
  fontWeight: 400,
  lineHeight: '20px',
  margin: 0,
};

export const boldTextStyle = {
  fontFamily: "'ABCDiatype-Bold'",
  fontSize: '14px',
  fontWeight: 400,
  lineHeight: '20px',
  margin: 0,
};

export const imageStyle = {
  maxWidth: '500px',
  maxHeight: '500px',
  display: 'block',
  objectFit: 'contain',
};

export const columnFlexStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};

export const columnAltFlexStyle = {
  display: 'flex',
  flexDirection: 'column',
};
