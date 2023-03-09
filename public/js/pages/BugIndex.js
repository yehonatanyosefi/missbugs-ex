'use strict'
import { bugService } from '../services/bug.service.js'
import BugList from '../cmps/BugList.js'
import BugFilter from '../cmps/BugFilter.js'
import { eventBusService } from '../services/event-bus.service.js'
import { showErrorMsg, showSuccessMsg } from '../services/event-bus.service.js'

export default {
	template: `
	
    <section class="bug-app">
        <div class="subheader">
          <BugFilter @setFilterBy="setFilterBy"></BugFilter> ||
          <router-link to="/bug/edit">Add New Bug</router-link>  ||
		<button @click="getPage(-1)">Prev</button> |
		<button @click="getPage(1)">Next</button>
		<!-- <a @click.prevent="downloadPDF" href="">Download PDF</a> -->
        </div>
        <BugList v-if="bugs" :bugs="bugs" @removeBug="removeBug"></BugList>
    </section>
    `,
	data() {
		return {
			bugs: null,
			bugsLength: null,
			pageSize: null,
			filterBy: {
				txt: '',
				label: '',
				severity: 1,
				page: 0,
				sort: 'title',
			},
		}
	},
	created() {
		this.loadBugs()
		this.unsubscribe = eventBusService.on('loadBugs', this.loadBugs)
	},
	methods: {
		loadBugs() {
			bugService.query(this.filterBy).then((queryObj) => {
				this.bugs = queryObj.bugs
				this.pageSize = queryObj.pageSize
				this.bugsLength = queryObj.length
			})
		},
		getPage(dir) {
			this.filterBy.page += dir
			const pageCount = Math.ceil(this.bugsLength / this.pageSize) - 1
			if (this.filterBy.page < 0) this.filterBy.page = pageCount
			if (this.filterBy.page > pageCount) this.filterBy.page = 0
			this.loadBugs()
		},
		setFilterBy(filterBy) {
			this.filterBy = filterBy
			this.loadBugs()
		},
		removeBug(bugId) {
			bugService.remove(bugId)
				.then(() => {
					const idx = this.bugs.findIndex(bug => bug._id === bugId)
					this.bugs.splice(idx, 1)
					showSuccessMsg('Bug removed')
				})
				.catch(err => {
					showErrorMsg('Bug remove failed')
				})
		},
		downloadPDF() {
			bugService.buildBugsPDF()
				.then(res => this.downloadBlob(res.data))
		},
		downloadBlob(file, filename = 'Bugs.pdf') {
			const url = window.URL.createObjectURL(new Blob([file]))
			const link = document.createElement('a')
			link.href = url
			link.setAttribute('download', `FileName.pdf`)
			document.body.appendChild(link)
			link.click()
			link.parentNode.removeChild(link)

			// const blob = new Blob([file], { type: 'application/pdf' })
			// console.log(`blob:`, blob)
			// const url = window.URL.createObjectURL(blob)
			// const a = document.createElement('a')
			// a.style.display = 'none'
			// a.href = url
			// a.download = filename
			// document.body.appendChild(a)
			// a.click()
			// window.URL.revokeObjectURL(url)
		},
	},
	unmounted() {
		this.unsubscribe()
	},
	components: {
		BugList,
		BugFilter,
	},
}
