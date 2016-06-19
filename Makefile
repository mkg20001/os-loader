#The final Makefile
BDIR="/tmp/os-loader-builddir"
image: builddir os-gui theme debs
	sudo make -C image build BDIR=$(BDIR)
debs:
	#Collect built .deb files
	mkdir -p $(BDIR)/deb
	cp -r -v $(BDIR)/*.deb $(BDIR)/deb
builddir:
	rm -rf $(BDIR)
	mkdir -p $(BDIR)
theme:
	make -C plymouth-theme BDIR=$(BDIR) cp
os-gui:
	make -C gui BDIR=$(BDIR) deb
