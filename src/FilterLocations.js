import React, { Component } from 'react';
import escapeRegExp from 'escape-string-regexp';

import * as dataLocations from './locations.json';

class FilterLocations extends Component {
	constructor(props) {
		super(props);
		this.state = {
			query: '',
			filteredLocations: dataLocations,
			filteredMarkers: [],
			currentMarker: {}
		};
	}

	componentDidMount() {
		/* Set the filteredMarkers state to the value of the props */
		this.setState({
			filteredMarkers: this.props.markers
		});
	}

	updateQuery = (query) => {
		/* Update the visible query
		 * manage the sync of the different state arrays
		 */
		this.setState({
			query
		});
		this.handleDisplayedLocations(query);
	}

	handleDisplayedLocations = (query) => {
		/* Manage the sync of locations */
		let controlledThis = this;
		let filtLocations;
		let filtMarkers;

		if (query) {
			const match = new RegExp(escapeRegExp(query), 'i');

			/* Add location to the array if its title match the query */
			filtLocations = this.props.locationsList.filter(location =>
				match.test(location.title)
			);

			/* Add marker to the array if its title match the query */
			filtMarkers = this.props.markers.filter(marker =>
				match.test(marker.title)
			);

			this.setState({
				filteredLocations: filtLocations,
				filteredMarkers: filtMarkers
			});
		} else {
			this.setState({
				filteredLocations: this.props.locationsList,
				filteredMarkers: this.props.markers
			});
		}

		/* Display the markers on the map accordingly to the state */
		this.props.markers.map(marker => marker.setVisible(false));
		setTimeout(function () {
			controlledThis.props.markers.map(marker =>
				controlledThis.handleMarkersVisibility(marker))
		}, 1)
	}

	handleMarkersVisibility = (marker) => {
		/* Make the matching markers visible on the map */
		this.state.filteredMarkers.map(filteredMarker =>
			filteredMarker.id === marker.id && marker.setVisible(true)
		)
	}

	manageClickedMarker = (location) => {
		/* Manage the animation of the markers
		 * when clicking on the list item
		 */
		let controlledThis = this;

		this.removeAnimationMarker();
		this.addAnimationMarker(location);
		setTimeout(function () {
			controlledThis.removeAnimationMarker()
		}, 1250);

		this.getCurrentMarker(location);
		this.props.openInfoWindow(this.state.currentMarker);
	}

	removeAnimationMarker = () => {
		/* Remove all the animations */
		this.state.filteredMarkers.map(filteredMarker =>
			filteredMarker.setAnimation(null)
		)
	}

	addAnimationMarker = (location) => {
		/* Add animation to the active marker */
		this.state.filteredMarkers.map(filteredMarker =>
			filteredMarker.id === location.key &&
				filteredMarker.setAnimation(
					window.google.maps.Animation.BOUNCE)
		);
	}

	getCurrentMarker = (location) => {
		/* Get the marker clicked
		 * to give the good info in the InfoWindow
		 */
		this.state.filteredMarkers.map(filteredMarker =>
			filteredMarker.id === location.key &&
				this.setState({
					currentMarker: filteredMarker
				})
		);
	}

	render () {
		const { query, filteredLocations } = this.state;

		return (
			<aside className="list-box">
				<form
					className="list-form"
					onSubmit={(event) => event.preventDefault()}
				>
					<button
						className="list-btn"
					>
						List
					</button>

					<input
						className="list-input"
						type="text"
						placeholder="Filter Locations..."
						value={query}
						onChange={(event) => 
							this.updateQuery(event.target.value)}
					/>
				</form>

				<ul className="locations-list">
					{
						filteredLocations.map(location => (
							<li
								className="location-item"
								key={location.key}
								onClick={() => 
									this.manageClickedMarker(location)}
							>
								{location.title}
							</li>
						))
					}
				</ul>
			</aside>
		);
	}
}

export default FilterLocations;