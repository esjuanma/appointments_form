import React, { Component } from 'react';
import Calendar from 'react-calendar';
import './App.css';

class App extends Component {

	// You can change this!
	schedule = {
		from: 10,
		to: 22
	}

	// Initial state configuration
	itinitialFormState = {
		date: (() => {
			const date = new Date();
			date.setHours(0, 0, 0, 0);
			return date;
		})(),
		name: '',
		dateSetted: false,
		scheduleFrom: '',
		scheduleTo: ''
	}

	// Sets initial state
	state = Object.assign({}, this.itinitialFormState, {
		schedules: JSON.parse(localStorage.getItem('schedules')) || {},
		offline: !navigator.onLine
	})

	constructor () {
		super();

		document.body.addEventListener('offline', () => this.setState({ offline: true }), false);
		document.body.addEventListener('online', () => this.setState({ offline: false }), false);
	}

	// Sets value of inputs and selects
	setValue = (event) => {
		const { name, value } = event.target;

		this.setState({
			[name]: value
		});
	}

	dateChange = (date) => {
		date.setHours(0, 0, 0, 0); // <-- "Today" fix
		this.setState({
			date,
			dateSetted: true,
			scheduleFrom: '',
			scheduleTo: ''
		});
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
			scheduleTo,
			schedules
		} = this.state;

		// Minimal validations of name, date and hour range
		if (!name) {
			return this.setError('Name missing!');
		}
		if (!dateSetted) {
			return this.setError('Date missing!');
		}
		if (!scheduleFrom || !scheduleTo || scheduleFrom >= scheduleTo) {
			return this.setError('Please select a valid schedule range!');
		}

		const day = date.valueOf();

		// Creates schedule array for the selected day if empty
		schedules[day] = schedules[day] || Array(24).fill(null);
		
		// Cleans previous error (if any)
		this.clearError();

		// Fills day array
		this.setDateSchedule(schedules[day], scheduleFrom, scheduleTo, name);

		// Updates localStorage and state
		this.updateSchedules(schedules);

		// Shows a succes message to the user
		this.showSuccess();

		// Clears data
		this.clearForm();
	}

	setDateSchedule(dateSchedules, scheduleFrom, scheduleTo, person) {
		// Updates the day array with the setted hours (fills it with person name)
		for (let i = scheduleFrom; i < scheduleTo; i++) {
			dateSchedules[i] = person;
		}
	}

	updateSchedules(schedules) {
		// Save on localStorage
		localStorage.setItem('schedules', JSON.stringify(schedules));

		// Updates state
		this.setState({ schedules });
	}

	// Shows a success message to the user during 3 seconds
	showSuccess() {
		this.setState({ success: true });

		setTimeout(() => {
			this.setState({ success: false });
		}, 3000);
	}

	clearForm() {
		this.setState( this.itinitialFormState );
	}

	clearError() {
		this.setError(null);
	}

	setError(error) {
		this.setState({ error });
	}

	getSelectableHoursQuantity() {
		return this.schedule.to - this.schedule.from;
	}

	toAmPm(hour) {
		return {
			hour: hour <= 12 ? hour : hour - 12,
			ampm: hour < 12 ? 'am' : 'pm'
		};
	}

	getHourlyOptions(to) {
		// Get configuration
		const { from: hours_from, to: hours_to } = this.schedule;
		// Get current state
		const { dateSetted, date, schedules } = this.state;
		// Get scheduled hours (if any)
		const alreadyScheduled = dateSetted && schedules[date.valueOf()] || [];
		// Generates an array for the options
		const optionsArray = Array(this.getSelectableHoursQuantity()).fill(null);

		return optionsArray.map((n, hour) => {
			// Move hour to fit range
			hour = hours_from + hour;

			// Check if this is a disabled hour
			const disabled = alreadyScheduled[hour]// || (to && hours_from === hour || hours_to === hour);

			// Parse hour to string
			const hourValue = ('0' + (hour + (to ? 1 : 0))).substr(-2);

			// Parse hour to visible (am/pm)
			const ampmHour = this.toAmPm(hour);

			return <option key={hourValue + to} value={hourValue} disabled={disabled}>{ampmHour.hour + (to ? 1 : 0)}:00 {ampmHour.ampm}</option>
		});
	}

	formatDate(date) {
		return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
	}

	hoursShowCase(todaySchedule) {
		const { from } = this.schedule;
		
		const hourBlockTitle = (hour) => {
			return `${hour.hour}:00 ${hour.ampm}. ${unavailable ? 'Sorry, unavailable' : 'Available!'}`;
		};

		const hourBlock = (hour, unavailable) => {
			return <div title={hourBlockTitle(this.toAmPm(hour))} key={'block' + hour} className={unavailable && 'unavailable'}></div>;
		}

		const hoursArray = Array(this.getHoursQuantity()).fill(null);
		
		return (
			<div className="hours-showcase">{
				hoursArray.map((n, hour) => {
					hour += from;
					const unavailable = todaySchedule && todaySchedule[hour];
					return hourBlock(hour, unavailable);
				})
			}</div>
		);
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
			name,
			scheduleFrom,
			scheduleTo,
			schedules,
			offline
		} = this.state;

		const todaySchedule = schedules[date.valueOf()];

		return (
			<div className={`App ${(offline ? 'offline' : '')}`}>
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
							
						{dateSetted && this.hoursShowCase(todaySchedule)}

						<fieldset>
							<label>And now select a time range:</label>
							From <select name="scheduleFrom" value={scheduleFrom} onChange={this.setValue}><option value="">-</option>{optionsFrom}</select>&nbsp;
							to <select name="scheduleTo" value={scheduleTo} onChange={this.setValue}><option value="">-</option>{optionsTo}</select>
						</fieldset>

						<button onClick={this.makeReservation}>Confirm</button>

					</div>

					<footer>
						{error && <span className="error">{error}</span>}
						{success && <span className="success">Awesome! You have scheduled successfully.</span>}
						{offline && <div className="error">
							It seems that you are offline.<br />
							You need to connect to schedule your appointment!
						</div>}
					</footer>

				</form>
			</div>
		);
	}
}

export default App;
