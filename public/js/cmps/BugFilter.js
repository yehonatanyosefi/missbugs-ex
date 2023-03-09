'use strict'
export default {
  template: `
        <section class="bug-filter">
            <span>Search: </span>
            <input @input="setFilterBy" type="search" v-model="filterBy.txt">
            <br>
            <span>Min Severity: </span>
            <input @input="setFilterBy" type="number" v-model="filterBy.severity">
            <br>
            <label for="labels">Search Label:</label>
            <select name="labels" id="labels" v-model="filterBy.label" @change="setFilterBy">
              <option value="" selected="selected">All</option>
              <option value="critical">Critical</option>
              <option value="dev-branch">Dev-Branch</option>
              <option value="typo">Typo</option>
              <option value="feature">Feature</option>
            </select>
            <br>
            <label for="sort">Sort by:</label>
            <select name="sort" id="sort" v-model="filterBy.sort" @change="setFilterBy">
              <option value="title">Title</option>
              <option value="description">Description</option>
              <option value="severity">Severity</option>
              <option value="createdAt">Created At</option>
            </select>
        </section>
    `,
  data() {
    return {
      filterBy: {
        txt: '',
        label: '',
        severity: 1,
        page: 0,
        sort: 'title',
      },
    }
  },
  methods: {
    setFilterBy() {
      this.$emit('setFilterBy', this.filterBy)
    },
  },
  mounted() {
    this.setFilterBy
  },
}
