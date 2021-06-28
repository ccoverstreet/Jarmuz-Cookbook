class extends HTMLElement {
	constructor() {
		super();

		this.getRecipeList = this.getRecipeList.bind(this);
		this.addRecipe = this.addRecipe.bind(this);

		this.attachShadow({mode: "open"});
		
	}

	init(source, instName, config) {
		this.source = source;
		this.instName = instName;
		this.config = config;
		console.log(this.config);

		this.getRecipeList()

		this.shadowRoot.innerHTML = `
<link rel="stylesheet" href="/assets/standard.css"/>
<style>
svg > path {
	stroke: var(--clr-accent);
	stroke-width: 30px;
	stroke-linecap: round;
	fill: transparent;
}
</style>
<div class="jmod-wrapper">
	<div class="jmod-header" style="display:flex">
		<h1 id="title">${this.config.title}</h1>
		<svg viewBox="0 0 360 360">
			<path d="M60,60 L60,240  L180,300 L300,240 L300,60 L180,120 L60,60"/>
			<path d="M180,120 L180,300"/>
		</svg>
	</div>

	<hr>

	<select id="recipe-selector" style="font-size: 1.25em;">
	</select>

	<div id="recipe-viewer">
		<p>This would have a recipe viewer</p>
	</div>

	<input id="new-recipe-name"></input>
	<textarea id="new-recipe-ingredients"></textarea>
	<textarea id="new-recipe-instructions"></textarea>
	<button onclick="this.getRootNode().host.addRecipe()">Add Recipe</button>
	<button onclick="this.getRootNode().host.getRecipeList()">Get Recipes</button>
</div>
		`
	}

	getRecipeList() {
		fetch(`/jmod/getRecipeList?JMOD-Source=${this.source}`)
			.then(async data => {
				const res = await data.json();
				const selectElem = this.shadowRoot.getElementById("recipe-selector");

				selectElem.innerHTML = "";

				for (name of res) {
					var opt = document.createElement("option");
					opt.value = name;
					opt.textContent = name;
					selectElem.appendChild(opt);
				}
			})
			.catch(err => {
				console.error(err);
				console.log(err);
			})
	}

	addRecipe() {
		const name = this.shadowRoot.getElementById("new-recipe-name").value;
		const ingredients = this.shadowRoot.getElementById("new-recipe-ingredients").value;
		const instructions = this.shadowRoot.getElementById("new-recipe-instructions").value;

		const body = {name, ingredients, instructions};
		console.log(body);

		fetch(`/jmod/addRecipe?JMOD-Source=${this.source}`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify(body)
		})
			.then(async data => {
				console.log(await data.text());
			})
			.catch(err => {
				console.error(err);
				console.log(err);
			})
	}
}
