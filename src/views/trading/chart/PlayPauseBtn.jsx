import PlayArrow from '@mui/icons-material/PlayArrow'
import Pause from '@mui/icons-material/Pause'

const PlayPauseBtn = ({ isPlaying, setIsPlaying }) => {
	const btnClickHandler = () => {
		setIsPlaying(!isPlaying)
	}

	return (
		<>
			{isPlaying && <Pause onClick={btnClickHandler} />}
			{!isPlaying && <PlayArrow onClick={btnClickHandler} />}
		</>
	)
}

export default PlayPauseBtn
