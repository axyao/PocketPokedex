class TeamList {

    constructor(_config, data) {
        this.config = {
            parentElement: _config.parentElement
        }

        this.container = document.getElementById(this.config.parentElement);
        this.data = data;
        this.populateContainer();
    }

    populateContainer() {
        if (this.data.length == 0) {
            const emptyMessage = `
                <div class="emptyMessage">Select a pokemon from the scatterplot</div>
                `;

            this.container.innerHTML = emptyMessage;
        } else {
            let aggregatedCards = [];
            this.data.forEach((d) => {
                const cardContent = `
                    <div class="card" id="${d.number}">
                        <img class="card-image" src="${d.image}">
                        <div class="card-number">#${d.number}</div>
                        <div class="card-name">${d.name}</div>
                        <ul class="card-types">
                            ${d.types.map(type => `<li style="background-color: ${colorScale(type)}">${type}</li>`).join("")}
                        </ul>
                        <span id="${d.name}" class="card-close">&#10006</span>
                    </div>
                    `;
    
                    aggregatedCards += cardContent;
            });
            this.container.innerHTML = aggregatedCards;

            var closebtns = document.getElementsByClassName("card-close");

            for (var i = 0; i < closebtns.length; i++) {
                closebtns[i].addEventListener("click", function(e) {
                    selected = selected.filter(d => e.target.id != d.name);
                    updateTeam();
                });
            }
            d3.selectAll('.card')
                .on('mouseover', (e) => {
                    if (e.target.id !== '' && e.target.id !== hovered) {
                        hovered = e.target.id;
                        updateRadar();
                    }
                })
                .on('mouseleave', () => {
                    hovered = 0;
                    updateRadar();
                });
        }
    }
}