import React, { Component } from 'react';
import Calendar from 'react-calendar';
import './App.css';

class App extends Component {
	
	schedule = {
		from: 10,
		to: 22
	}

	state = {
		date: new Date(),
		name: ''
	}

	setValue = (event) => {
		const { name, value } = event.target;

		this.setState({
			[name]: value
		});
	}

	dateChange = (date) => {
		this.setState({ date, dateSetted: true });
		this.hideCalendar();
	}

	showCalendar = () => {
		this.setState({ showCalendar: true });
	}

	hideCalendar = () => {
		this.setState({ showCalendar: false });
	}

	makeReservation = (event) => {
		event.preventDefault();

		const {
			name,
			dateSetted,
			date,
			scheduleFrom,
			scheduleTo
		} = this.state;

		if(!name) {
			return this.setError('Name missing!');
		}

		if(!dateSetted) {
			return this.setError('Date missing!');
		}

		if(!scheduleFrom || !scheduleTo || scheduleFrom >= scheduleTo) {
			return this.setError('Please select a valid schedule range!');	
		}

		const schedules = JSON.parse(localStorage.getItem('schedules')) || {};
		const day = date.valueOf();
		
		if(schedules[day]) {
			for(let i = scheduleFrom; i < scheduleTo; i++) {
				if(schedules[day][i]) {
					return this.setError(`This schedule isn't available; ${schedules[day][i]} already took ${('0'+i).substr(-2)}:00`);
				}
			}
		} else {
			schedules[day] = Array(24).fill(null);
		}

		this.clearError();
		this.setDateSchedule(schedules[day], scheduleFrom, scheduleTo, name);
		this.updateSchedules(schedules);
		this.showSuccess();
	}

	setDateSchedule(dateSchedules, scheduleFrom, scheduleTo, person) {
		for(let i = scheduleFrom; i < scheduleTo; i++) {
			dateSchedules[i] = person;
		}
	}

	updateSchedules(schedules) {
		localStorage.setItem('schedules', JSON.stringify(schedules));
	}

	showSuccess() {
		this.setState({ success: true });
		
		setTimeout(() => {
			this.setState({ success: false });
		}, 3000);
	}

	clearError() {
		this.setError(null);
	}

	setError(error) {
		this.setState({ error });
	}

	getHourlyOptions(to) {
		const { from: hours_from, to: hours_to } = this.schedule;
		const availableHours = hours_to - hours_from;

		return Array(availableHours).fill(null).map((n, hour) => {
			hour = ('0' + (hours_from + hour + (to ? 1 : 0))).substr(-2);
			return <option key={hour + to} value={hour}>{hour}:00hs</option>
		});
	}

	formatDate(date) {
		return `${date.getFullYear()}/${date.getMonth()+1}/${date.getDate()}`;
	}

	render() {
		const optionsFrom = this.getHourlyOptions();
		const optionsTo = this.getHourlyOptions(true);
		const {
			dateSetted,
			date,
			error,
			success,
			showCalendar,
			name
		} = this.state;

		return (
			<div className="App">
				<form>

					<header>
						<h2>HealthCO</h2>
						<h4>Schedule appointments</h4>
					</header>

					<div className="body">

						<fieldset>
							<label>Name</label>
							<input type="text" value={name} name="name" onChange={this.setValue} />
						</fieldset>

						<fieldset>
							<label onClick={this.showCalendar} className="date-label">
								{dateSetted
									? this.formatDate(date)
									: '--> Please pick a date! <--'
								}
							</label>
							{showCalendar && 
								<Calendar onChange={this.dateChange} value={date} minDate={new Date()} />
							}
						</fieldset>

						<fieldset>
							<label>And now select a time range:</label>
							From <select name="scheduleFrom" onChange={this.setValue}><option value="">-</option>{optionsFrom}</select>&nbsp;
							to <select name="scheduleTo" onChange={this.setValue}><option value="">-</option>{optionsTo}</select>
						</fieldset>

						<button onClick={this.makeReservation}>Confirm</button>

						{error && <span className="error">{error}</span>}
						{success && <span className="success">Awesome! You have scheduled successfully.</span>}
					</div>

				</form>
			</div>
		);
	}
}

export default App;
