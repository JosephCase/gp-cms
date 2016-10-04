var homePage = require("../homePage");

describe("Get the homepage", function() {
	it('It passes a string to its callback', function(done) {
		homePage.getPage(function(html) {
			expect(typeof html).toBe('string');
			done();
		})
	})
});


describe("Get the homepage content", function() {
	it('It passes an object to its callback', function(done) {
		homePage.getPageContent(function(nestedResults) {

			expect(Array.isArray(nestedResults)).toBe(true);
			expect(nestedResults.length).toBeGreaterThan(0);
			for (var i = 0; i < nestedResults.length; i++) {
				expect(typeof nestedResults[i]).toBe('object');
				expect(nestedResults[i].id).toBeTruthy();
				expect(typeof nestedResults[i].name).toBe('string');
				expect(nestedResults[i].isParent == 0 || nestedResults[i].isParent == 1).toBe(true);
				expect(nestedResults[i].visible == 0 || nestedResults[i].visible == 1).toBe(true);
			}
 
			done();
		});
	})
})



