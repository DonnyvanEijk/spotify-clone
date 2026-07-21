"use client";

import Image, { ImageProps } from "next/image";
import { useEffect, useState } from "react";

const FALLBACK_SRC = "/images/fallback.png";

type Props = Omit<ImageProps, "src"> & {
  src?: ImageProps["src"] | null;
  fallbackSrc?: string;
};

const ImageWithFallback: React.FC<Props> = ({
  src,
  fallbackSrc = FALLBACK_SRC,
  alt,
  ...rest
}) => {
  const [current, setCurrent] = useState<ImageProps["src"]>(src || fallbackSrc);

  useEffect(() => {
    setCurrent(src || fallbackSrc);
  }, [src, fallbackSrc]);

  const isFallback = current === fallbackSrc;

  return (
    <Image
      {...rest}
      alt={alt}
      src={current}
      onError={() => {
        if (!isFallback) setCurrent(fallbackSrc);
      }}
      unoptimized={isFallback || rest.unoptimized}
    />
  );
};

export default ImageWithFallback;
