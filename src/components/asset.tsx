import * as React from "react";
import { BlockType, ContentValueType, MapImageUrl } from "../types";

const types = ["video", "image", "embed", "figma"];

const Asset: React.FC<{
  block: BlockType;
  mapImageUrl: MapImageUrl;
}> = ({ block, mapImageUrl }) => {
  const value = block.value as ContentValueType;
  const type = block.value.type;

  if (!types.includes(type)) {
    return null;
  }

  const format = value.format;
  const {
    display_source = undefined,
    block_aspect_ratio = undefined,
    block_height = 1,
    block_width = 1
  } = format ?? {};

  const aspectRatio = block_aspect_ratio || block_height / block_width;

  if (type === "embed" || type === "video" || type === "figma") {
    return (
      <div
        style={{
          paddingBottom: `${aspectRatio * 100}%`,
          position: "relative"
        }}
      >
        <iframe
          className="notion-image-inset"
          src={
            type === "figma" ? value.properties.source[0][0] : display_source
          }
        />
      </div>
    );
  }

  if (block.value.type === "image") {
    const src = mapImageUrl(value.properties.source[0][0], block);
    const caption = value.properties.caption?.[0][0];

    return <LoadedImage block_aspect_ratio={block_aspect_ratio} src={src} caption={caption} aspectRatio={aspectRatio} />
    
  }

  return null;
};

const LoadedImage = ({src,block_aspect_ratio,aspectRatio,caption}:{caption:any,src:string,block_aspect_ratio:any,aspectRatio:any}) => {

  const [url,setUrl] = React.useState('');

   const get = async() => {
      try{
          const res = await fetch(src,{headers:{
              'Cookie':'notion_v2=ea62442e89b5ec1f4642601b83a11b48a67915beb347f07ffaf2b3f11d9a0b2aa46bcaf7258d88827d804f3452916c15ebfde9c8e8023262394d23da9549594bb6a50657b7b21c46148719ce1bba'
          }});
          console.log(res);
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          console.log(url);
          setUrl(url);
      }catch(e){
          setUrl(src);
      };
   };

   React.useEffect(()=>{
      get();
   },[]);

   if (block_aspect_ratio) {
    return (
      <div
        style={{
          paddingBottom: `${aspectRatio * 100}%`,
          position: "relative"
        }}
      >
        <img
            className="notion-image-inset"
            alt={caption || "notion image"}
            src={url||src}
          />
        </div>
      );
    } else {
      return <img alt={caption} src={url||src} />;
    }

};

export default Asset;
