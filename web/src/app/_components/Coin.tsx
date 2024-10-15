"use client";
import Image from "next/image";
import { useEffect, useState } from "react";

const Coin = ({ side }:any) => {
	const [animation, setAnimation] = useState({});

	useEffect(() => {
		switch (side) {
			case "heads":
				setAnimation({ animation: "flip-heads 1s linear 0s 1 forwards" });
				break;
			case "tails":
				setAnimation({ animation: "flip-tails 1s linear 0s 1 forwards" });
				break;
			case "loading":
				setAnimation({ animation: "flip 8s linear 0s infinite" });
				break;
			default:
				setAnimation({});
		}
	}, [side]);

	return (
		<>
			<div id="coin" style={animation}>
				<div className="heads">
					<Image width={100} height={100} src="/assets/tails.png" alt="Coin's tail" />
				</div>
				<div className="tails">
					<Image width={100} height={100}  src="/assets/heads.png" alt="Coin's head" />
				</div>
			</div>
		</>
	);
};

export default Coin;