class extends HTMLElement {
	constructor() {
		super();

		this.getRecipeList = this.getRecipeList.bind(this);
		this.addRecipe = this.addRecipe.bind(this);

		this.attachShadow({mode: "open"});
		this.shadowRoot.innerHTML = `
<link rel="stylesheet" href="/assets/standard.css"/>
<div class="jmod-wrapper">
	<div class="jmod-header" style="display:flex">
		<h1>Cookbook</h1>
		<svg viewBox="0 0 360 360">
			<path d="M150,300 A30,60,0,0,1,210,300" stroke="var(--clr-accent)" stroke-width="30" stroke-linecap="round" fill="transparent"/>
			<path d="M105,300 A60,90,0,0,1,255,300" stroke="var(--clr-accent)" stroke-width="30" stroke-linecap="round" fill="transparent"/>
			<path d="M60,300 A60,80,0,0,1,300,300" stroke="var(--clr-accent)" stroke-width="30" stroke-linecap="round" fill="transparent"/>
		</svg>
	</div>

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

	init(source, instName, config) {
		this.source = source;
		this.instName = instName;
		this.config = config;

		this.getRecipeList()
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
