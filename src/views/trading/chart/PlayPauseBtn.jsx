import PlayArrow from '@mui/icons-material/PlayArrow'
import Pause from '@mui/icons-material/Pause'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import { PlayStatus } from './Index'
import { Fab } from '@mui/material'

const PlayPauseBtn = ({ playStatus, setPlayStatus }) => {
	const btnClickHandler = () => {
		let newStatus
		if (playStatus == PlayStatus.playing) {
			newStatus = PlayStatus.paused
		} else if (playStatus == PlayStatus.paused) {
			newStatus = PlayStatus.playing
		} else if (playStatus == PlayStatus.done) {
			newStatus = PlayStatus.resetting
		}

		setPlayStatus(newStatus)
	}

	return (
		<Fab color="primary" onClick={btnClickHandler}>
			{playStatus == PlayStatus.playing && <Pause />}
			{playStatus == PlayStatus.paused && <PlayArrow />}
			{(playStatus == PlayStatus.done || playStatus == PlayStatus.resetting) && <RestartAltIcon />}
		</Fab>
	)
}

export default PlayPauseBtn
