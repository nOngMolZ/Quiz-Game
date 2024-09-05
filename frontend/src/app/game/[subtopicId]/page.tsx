"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import GameNav from "../components/GameNav";
import Game from "../components/Game";
import Leaderboard from "../components/Leaderboard";
import ModalTimeout from "../components/ModalTimeout";
import ModalExit from "../components/ModalExit";
import { createScore } from "@/lib/scoreApi";
import { Subtopic } from "@/types/SubTopic";
import { ScoreInput } from "@/types/score";
import { Question } from "@/types/Question";
import { SubTopicApi } from "@/lib/SubTopicApi";
import { useUser } from "@/context/userContext";
import { QuestionApi } from "@/lib/questionApi";

interface Props {
	params: {
		subtopicId: string;
	};
}

export default function GamePage({ params }: Props) {
	const router = useRouter();
	const { subtopicId } = params;
	const { User } = useUser();

	const [reload, setReload] = useState<boolean>(false);

	const [time, setTime] = useState<number>(30000);
	const [start, setStart] = useState<boolean>(false);

	const [showTimeout, setShowTimeout] = useState<boolean>(false);
	const [showExit, setShowExit] = useState<boolean>(false);

	const [subtopic, setSubtopic] = useState<Subtopic>({
		_id: "",
		subtopicName: "",
		time: 30000,
		category: "",
		topicId: "",
		topicName: "",
	});
	const [questionList, setQuestionList] = useState<Question[]>([]);
	const [score, setScore] = useState<number>(0);
	const [scoreData, setScoreData] = useState<ScoreInput>({
		userId: `${User?.id}`,
		subtopicId: `${subtopicId}`,
		score: 0,
		timeSpent: 0,
	});

	useEffect(() => {
		getSubtopic(subtopicId);
		getQuestion(subtopicId);

		const timeoutId = setTimeout(() => {
			setStart(true);
		}, 1000);

		return () => clearTimeout(timeoutId);
	}, []);

	useEffect(() => {
		setScoreData((prevData) => {
			return { ...prevData, score: score, timeSpent: subtopic.time - time };
		});

		if (time === 0) setShowTimeout(true);
		if (time === 0 || questionList.length === 0) saveScore(scoreData);
		if (!start || time <= 0) return;
		if (showExit === true) return;

		const intervalId = setInterval(() => {
			setTime((prevSeconds) => prevSeconds - 1000);
		}, 1000);

		return () => clearInterval(intervalId);
	}, [start, time, showExit]);

	async function getSubtopic(id: string) {
		try {
			const getSubtopic = await SubTopicApi.getSubtopicById(id);

			setSubtopic(getSubtopic);
			setTime(getSubtopic.time);
		} catch (error) {
			console.error("Failed to get Subtopic:", error);
		}
	}

	async function getQuestion(id: string) {
		try {
			const getQuestion = await QuestionApi.getQuestionsBySubtopicId(id);

			setQuestionList(getQuestion);
		} catch (error) {
			console.error("Failed to get Question:", error);
		}
	}

	async function saveScore(data: ScoreInput) {
		await createScore(data);
	}

	function handleRestart(): void {
		setShowTimeout(false);
		setShowExit(false);
		setReload(!reload);
		setScore(0);
		setTime(subtopic?.time || 30000);
	}

	function handleExit(): void {
		router.push("/selectgame");
	}

	return (
		<>
			<div className="flex flex-col gap-8 h-screen">
				<div>
					<GameNav time={time} score={score} />
				</div>
				<div className="flex gap-8 justify-center items-center h-11/12">
					<Game
						time={time}
						setTime={setTime}
						subtopic={subtopic}
						score={score}
						setScore={setScore}
						questionList={questionList}
						setQuestionList={setQuestionList}
						setShowExit={setShowExit}
						handleRestart={handleRestart}
						reload={reload}
						setReload={setReload}
					/>
					<Leaderboard subtopic={subtopic} />
				</div>
				<ModalTimeout
					score={score}
					showTimeout={showTimeout}
					handleRestart={handleRestart}
					handleExit={handleExit}
				/>
				<ModalExit
					showExit={showExit}
					setShowExit={setShowExit}
					handleExit={handleExit}
				/>
			</div>
		</>
	);
}
