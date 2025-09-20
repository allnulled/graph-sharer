(() => {
  let isFirstTime = true;
  // Change this component at your convenience:
  Vue.component("App", {
    template: $template,
    props: {
      uuid: {
        type: String,
        default: () => {
          return Vue.prototype.$lsw.utils.getRandomString(10);
        }
      }
    },
    data() {
      return {
        isMounted: false,
        selectedPanel: "edicion", // also: "edicion", "visualizacion"
        source: '',
        placeholder: `return Plot.plot({
  x: {
    axis: "top",
    grid: true,
    percent: true
  },
  marks: [
    Plot.ruleX([0]),
    Plot.barX([{
      letter:'a',frequency:3
    }, {
      letter:'b',frequency:2
    }, {
      letter:'c',frequency:1
    }], {
      x: "frequency",
      y: "letter",
      sort: {
        y: "x",
        reverse: true
      }
    })
  ]
})`,
        compilated: "",
      };
    },
    methods: {
      async selectPanel(panel) {
        this.$trace("App.methods.selectPanel");
        if(panel === "visualizacion") {
          await this.compile();
        }
        this.selectedPanel = panel;
      },
      async compile() {
        this.$trace("App.methods.compile");
        const chartElement = await LswUtils.createAsyncFunction(this.source).call(this);
        this.$refs.graphRenderer.innerHTML = "";
        this.$refs.graphRenderer.appendChild(chartElement);
      },
      async visualize() {
        this.$trace("App.methods.visualize");
        return await this.selectPanel("visualizacion");
      },
      exportAsLink() {
        this.$trace("App.methods.exportAsLink");
        console.log("exporting as link");
        const parameters = new URLSearchParams({ source: this.source });
        const url = new URL(window.location.href);
        const productLink = `${url.protocol}//${url.hostname}:${url.port}${url.pathname}?${parameters.toString()}`;
        LswUtils.copyToClipboard(productLink);
        this.$lsw.toasts.send({
          title: "Link exportado al portapapeles",
          text: productLink,
        });
      }
    },
    async mounted() {
      console.log("[💛] Application mounted.");
      await LswLazyLoads.loadD3js();
      await LswLazyLoads.loadObservablePlot();
      this.isMounted = true;
      if (isFirstTime) {
        Vue.prototype.$app = this;
        isFirstTime = false;
        window.dispatchEvent(new CustomEvent("lsw_app_mounted", {
          applicationUuid: this.uuid,
          $lsw: this.$lsw,
          appComponent: this,
        }));
        await LswLifecycle.onApplicationMounted();
        Adjust_text_height: {
          this.$refs.editorDeTexto.style.height = (this.$window.innerHeight - 70) + "px";
        }
        Load_link: {
          const parameters = new URLSearchParams(window.location.search);
          const source = parameters.get("source");
          if(!source) {
            break Load_link;
          }
          this.source = source;
          this.visualize();
        }
      }
    }
  });
})(); 