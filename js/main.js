// global objects
let data, filter, radar, scatter, histogram, team, colorScale, mapping;
let selected = [];
let searched = [];
let typeSelect = null;
let hovered = 0;
// let stats = ['Health', 'Attack', 'Defense', 'Special Attack', 'Special Defense', 'Speed'];
let types = ["Normal", "Fire", "Water", "Grass", "Flying", "Fighting",
        "Poison", "Electric", "Ground", "Rock", "Psychic", "Ice", "Bug",
        "Ghost", "Steel", "Dragon", "Dark", "Fairy"];
let color = ["#9ea09e", "#e52829", "#297fee", "#3fa029", "#80b8ee", "#fd7f01",
        "#9041ca", "#f9bf01", "#905121", "#aea880", "#ee4179", "#3fd7fe", "#90a019",
        "#704170", "#60a0b7", "#5060e0", "#50413f", "#ee70ee"];


// read data
d3.csv('data/pokemon.csv', (d) => {
    // console.log(d)

    // preprocess the data
    return {
        name: d.name,
        image: "data/pokemon-images/" + d.name.toLowerCase() + ".png",
        number: +d.pokedex_number,
        types: (d.type2 === "" || d.type2 === d.type1)? [d.type1]: [d.type1, d.type2],
        abilities: d.abilities,
        hp: +d.hp,
        atk: +d.attack,
        sp_atk: +d.sp_attack,
        def: +d.defense,
        sp_def: +d.sp_defense,
        spd: +d.speed,
        sum: +d.base_total,
    }
}).then(_data => {
    data = _data;

    // initialize global variables
    colorScale = d3.scaleOrdinal()
        .domain(types.map(d => d.toLowerCase()))
        .range(color);

    // mapping from text label to attribute accessor
    mapping = {
        'Health': d => d.hp,
        'Attack': d => d.atk,
        'Defense': d => d.def,
        'Special Attack': d => d.sp_atk,
        'Special Defense': d => d.sp_def,
        'Speed': d => d.spd,
        'Sum': d => d.sum
    }

    // initialize views
    filter = new TypeFilter({parentElement: '#type-filter'}, types);
    histogram = new Histogram({parentElement: '#histogram'}, data);
    scatter = new ScatterPlot({parentElement: '#scatter-plot'}, data);
    radar = new RadarChart({parentElement: '#radar-chart'}, selected);
    team = new TeamList({parentElement: 'team-container'}, selected);

    console.log(data);

}).catch(error => console.error(error));

let update = (view, new_data) => {
    view.data = new_data
    view.updateVis()
}

// update other views when type selection is changed
updateType = () => {
    let new_data = (typeSelect)? d3.filter(data, d => d.types.includes(typeSelect)): data

    update(histogram, new_data)
    update(scatter, new_data)
}

// update when the slider is changed
updateFilter = () => {
    let filter_range = histogram.getRange()
    let new_data = d3.filter(data, d => d.sum >= filter_range[0] && d.sum <= filter_range[1])
    new_data = (typeSelect)? d3.filter(new_data, d => d.types.includes(typeSelect)): new_data

    update(scatter, new_data)
}

// update when mark is clicked or the image is removed
updateTeam = () => {
    update(radar, selected);
    scatter.renderVis();

    team.data = selected;
    team.populateContainer();
}

// update when the image is hovered
updateRadar = () => {
    radar.renderVis()
}

d3.select('#user-input').on('keyup', function() {
    var inputValue = d3.select('#user-input').property('value').toLowerCase();

    var searchedPokemon = inputValue !== "" ? data.filter(pokemon => pokemon.name.toLowerCase().startsWith(inputValue)) : data;

    update(scatter, searchedPokemon);
});
