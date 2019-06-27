<%@ Page Language="C#" Inherits="eSRO.Rendering.BaseScreenPage" AutoEventWireup="true" %>

<asp:Content ContentPlaceHolderID="body" runat="server">
    <main>
		<section class="calendar-message">
			<div class="message-container">
				<h2>THIS WAY FOR ADVENTURE.</h2>
				<p><%=Esro.GetString(5000306) %></p>
			</div>
		</section>
        <section class="event-selection" id="calendar">
			<div class="event-title"></div>
			<div class="instructions">SELECT DATE AND TIME</div>
			<div class="change-selection-container">
				<button onclick="showChangeSelectionMenu()" class="change-selection">Change Selection</button>
			</div>
            <div class="date_picker"></div>
        </section>
		<section class="time-legend">
			<div class="legend-container" id="times">
				<div class="leg">
					<div class="legend good"></div><div class="description">Good Availability</div>
				</div>
				<div class="leg">
					<div class="legend average"></div><div class="description">Limited Availability</div>
				</div>
				<div class="leg">
					<div class="legend poor"></div><div class="description">Last Tickets</div>
				</div>
			</div>
		</section>
		<section class="event-times"></section>
    </main>
    <script src="/UserContent/js/main.js"></script>
	<script src="/UserContent/js/changeSelection.js"></script>
	<script src="https://goape.co.uk/assets/scripts/views/min/find-external.min.js" data-url="https://goape.co.uk"></script>
	
</asp:Content>